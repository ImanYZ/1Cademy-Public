import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import * as functions from "firebase-functions";

import { IActionTrack } from "./types/IActionTrack";
import { IUser } from "./types/IUser";
admin.initializeApp();

// Since this code will be running in the Cloud Functions environment
// we call initialize Firestore without any arguments because it
// detects authentication from the environment.
const firestore = admin.firestore();

const getUser = async (uname: string) => {
  const user = await firestore.collection("users").doc(uname).get();
  return user.data() as IUser;
};

export const actionTracks = functions.https.onRequest(async (req, res) => {
  const userActionTracks: {
    [uname: string]: {
      uname: string;
      community: string;
      condition: "Reputation" | "Interactions";
      interactions: number;
      reputation: number;
    };
  } = {};
  const usersMap: {
    [userId: string]: IUser;
  } = {};

  try {
    res.setHeader("Content-Type", "text/plain");
    const actionTracks = await firestore.collection("actionTracks").get();
    for (const actionTrack of actionTracks.docs) {
      const actionTrackData = actionTrack.data() as IActionTrack;
      const doer = actionTrackData.doer;
      if (!usersMap[doer]) {
        const doerUser = await getUser(doer);
        if (!doerUser) continue;
        usersMap[doer] = doerUser;
      }

      // initialization
      if (!userActionTracks[doer]) {
        userActionTracks[doer] = {
          uname: doer,
          community: usersMap[doer].tag,
          condition: usersMap[doer].livelinessBar === "reputation" ? "Reputation" : "Interactions",
          interactions: 0,
          reputation: 0,
        };
      }

      userActionTracks[doer].interactions += 1;

      const receivers = actionTrackData.receivers || [];
      const receiverPoints = actionTrackData.receiverPoints || [];
      for (let idx = 0; idx < receivers.length; idx++) {
        let defaultPoint = 0;
        if (actionTrackData.type !== "NodeVote") {
          if (
            actionTrackData.action === "Correct" ||
            actionTrackData.action.startsWith("Correct-") ||
            actionTrackData.action === "WrongRM" ||
            actionTrackData.action.startsWith("WrongRM-")
          ) {
            defaultPoint = 1;
          }

          if (
            actionTrackData.action === "Wrong" ||
            actionTrackData.action.startsWith("Wrong-") ||
            actionTrackData.action === "CorrectRM" ||
            actionTrackData.action.startsWith("CorrectRM-")
          ) {
            defaultPoint = -1;
          }
        }
        const point = receiverPoints[idx] || defaultPoint;
        const receiver = receivers[idx];

        if (!usersMap[receiver]) {
          const receiverUser = await getUser(receiver);
          if (!receiverUser) continue;
          usersMap[receiver] = receiverUser;
        }
        if (!userActionTracks[receiver]) {
          userActionTracks[receiver] = {
            uname: receiver,
            community: usersMap[receiver].tag,
            condition: usersMap[receiver].livelinessBar === "reputation" ? "Reputation" : "Interactions",
            interactions: 0,
            reputation: 0,
          };
        }

        userActionTracks[receiver].reputation += point;
      }
    }

    let response = "username,community,condition,interactions,reputation\n";
    for (const uname in userActionTracks) {
      const userActionTrack = userActionTracks[uname];
      response += `${JSON.stringify(uname)},${JSON.stringify(userActionTrack.community)},${JSON.stringify(
        userActionTrack.condition
      )},${JSON.stringify(userActionTrack.interactions)},${JSON.stringify(userActionTrack.reputation)}\n`;
    }
    res.status(200).send(response);
  } catch (e: any) {
    res.setHeader("Content-Type", "application/json");
    console.log(e);
    res.status(500).send({
      message: e.message,
    });
  }
});

export const onUserStatusChanged = functions.database.ref("/status/{uname}").onUpdate(async (change, context) => {
  // Get the data written to Realtime Database
  const eventStatus = change.after.val();

  // Then use other event data to create a reference to the
  // corresponding Firestore document.
  const userStatusFirestoreRef = firestore.doc(`status/${context.params.uname}`);
  const userStatusDoc = await userStatusFirestoreRef.get();
  const sessionIds = [];

  if (userStatusDoc.exists) {
    const userStatusData = userStatusDoc.data();
    if (Array.isArray(userStatusData?.sessionIds)) {
      sessionIds.push(...userStatusData!.sessionIds);
    }
  }

  if (eventStatus.sessionId) {
    const sessIdx = sessionIds.indexOf(eventStatus.sessionId);
    if (eventStatus?.state === "online" && sessIdx === -1) {
      sessionIds.push(eventStatus.sessionId);
    } else if (eventStatus?.state === "offline" && sessIdx !== -1) {
      sessionIds.splice(sessIdx, 1);
    }
  }

  let state = "online";
  if (eventStatus.state === "offline" && !sessionIds.length) {
    state = "offline";
  }

  // It is likely that the Realtime Database change that triggered
  // this event has already been overwritten by a fast change in
  // online / offline status, so we'll re-read the current data
  // and compare the timestamps.
  const statusSnapshot = await change.after.ref.once("value");
  const status = statusSnapshot.val();
  functions.logger.log(status, eventStatus);
  // If the current timestamp for this data is newer than
  // the data that triggered this event, we exit this function.
  if (status.last_changed > eventStatus.last_changed) {
    return null;
  }

  // Otherwise, we convert the last_changed field to a Date
  eventStatus.last_changed = new Date(eventStatus.last_changed);
  eventStatus.user = context.params.uname;

  // ... and write it to Firestore.
  return userStatusFirestoreRef.set({
    user: eventStatus.user,
    last_changed: eventStatus.last_changed,
    sessionIds,
    state,
  });
});

export const onActionTrackCreated = functions.firestore.document("/actionTracks/{id}").onCreate(async change => {
  try {
    const data = change.data();

    // create actionTracks
    const actionTracksLogRef = firestore.collection("actionTracks24h");
    const today = new Date();
    const MILLISECONDS_IN_A_DAY = 86400000;
    // expired is -2 days ago, to remove document in 24h, because TTL remove in 72h
    const twoDaysAgo = new Date(Number(today) - 2 * MILLISECONDS_IN_A_DAY);
    actionTracksLogRef.add({ ...data, expired: Timestamp.fromDate(twoDaysAgo) });

    // create recentUserNodes
    const recentUserNodesRef = firestore.collection("recentUserNodes");
    // expired is +2 days ago, to remove document in 5 days, because TTL remove in 72h
    const fiveDaysAgo = new Date(Number(today) + 2 * MILLISECONDS_IN_A_DAY);
    recentUserNodesRef.add({ user: data.doer, nodeId: data.nodeId, expired: Timestamp.fromDate(fiveDaysAgo) });
  } catch (error) {
    console.log("error:", error);
  }
});
