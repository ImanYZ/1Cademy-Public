import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import * as functions from "firebase-functions";

admin.initializeApp();

import { signalFlashcardChanges } from "./helpers";

const { assignNodeContributorsInstitutionsStats } = require("./assignNodeContributorsInstitutionsStats");
const { updateInstitutions } = require("./updateInstitutions");

import { nodeDeletedUpdates } from "./actions/nodeDeletedUpdates";
import { updateVersions } from "./actions/updateVersions";
import { checkNeedsUpdates } from "./helpers/version-helpers";
import { updatesNodeViewers } from "./actions/updatesNodeViewers";

// Since this code will be running in the Cloud Functions environment
// we call initialize Firestore without any arguments because it
// detects authentication from the environment.
const firestore = admin.firestore();
export const onUserStatusChanged = functions.database.ref("/status/{uname}").onUpdate(async (change, context) => {
  // Get the data written to Realtime Database
  const eventStatus = change.after.val();

  // Then use other event data to create a reference to the
  // corresponding Firestore document.
  const userStatusFirestoreRef = firestore.doc(`status/${context.params.uname}`);
  const userStatusDoc = await userStatusFirestoreRef.get();
  let sessions: {
    [sessionId: string]: Timestamp;
  } = {};

  if (userStatusDoc.exists) {
    const userStatusData = userStatusDoc.data();
    sessions = userStatusData?.sessions || {};
  }

  if (eventStatus.sessionId) {
    const sessionId = eventStatus.sessionId;
    if (eventStatus?.state === "online" && !sessions[sessionId]) {
      sessions[sessionId] = Timestamp.now();
    } else if (eventStatus?.state === "offline" && sessions[sessionId]) {
      delete sessions[sessionId];
    }
  }

  let state = "online";
  if (eventStatus.state === "offline" && !Object.keys(sessions).length) {
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
    sessions,
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

    const receiversData: any = {};

    for (let receiver of data.receivers) {
      const receiverDoc = await firestore.collection("users").doc(receiver).get();
      if (receiverDoc.exists) {
        const receiverData = receiverDoc.data();
        receiversData[receiver] = {
          fullname: receiverData?.fName + " " + receiverData?.lName,
          chooseUname: receiverData?.chooseUname,
          imageUrl: receiverData?.imageUrl,
        };
      }
    }
    actionTracksLogRef.add({ ...data, expired: Timestamp.fromDate(twoDaysAgo), receiversData });
    // create recentUserNodes
    const recentUserNodesRef = firestore.collection("recentUserNodes");
    // expired is +2 days ago, to remove document in 5 days, because TTL remove in 72h
    const fiveDaysAgo = new Date(Number(today) + 2 * MILLISECONDS_IN_A_DAY);
    recentUserNodesRef.add({ user: data.doer, nodeId: data.nodeId, expired: Timestamp.fromDate(fiveDaysAgo) });
  } catch (error) {
    console.log("error:", error);
  }
});

export const onNodeUpdated = functions.firestore.document("/nodes/{id}").onUpdate(async change => {
  try {
    const newValue = change.after.data();
    const previousValue = change.before.data();
    const nodeId = change.after.id;

    if (newValue.content !== previousValue.content || newValue.title !== previousValue.title) {
      console.log("node updated", nodeId);
      signalFlashcardChanges(nodeId, "update");
    }
    if (newValue.deleted) {
      console.log("node deleted", nodeId);
      signalFlashcardChanges(nodeId, "delete");
    }
  } catch (error) {
    console.log("error:", error);
  }
});

export const onNodeUpdatedVersions = functions.firestore.document("/nodes/{id}").onUpdate(async change => {
  try {
    const newValue = change.after.data();
    const previousValue = change.before.data();
    const nodeId = change.after.id;
    const needsUpdates = checkNeedsUpdates({ previousValue, newValue });
    if (needsUpdates) {
      updateVersions({ nodeId, nodeData: newValue });
    }
    console.log("Done Updating Versions");
  } catch (error) {
    console.log("error:", error);
  }
});

export const onNodeDeleted = functions.firestore.document("/nodes/{id}").onUpdate(async change => {
  try {
    const updatedData = change.after.data();
    const previousData = change.before.data();
    const nodeId = change.after.id;
    if (!previousData.deleted && updatedData.deleted) {
      console.log("updatedData.deleted", updatedData.deleted);
      console.log("node deleted", nodeId);
      await nodeDeletedUpdates({ nodeId, nodeData: updatedData });
    }
  } catch (error) {
    console.log("error onNodeDeleted:", error);
  }
});

export const onCloseOpenNode = functions.firestore.document("/userNodes/{id}").onUpdate(async change => {
  try {
    const updatedData = change.after.data();
    const previousData = change.before.data();
    const nodeId = updatedData.node;
    let viewers = updatedData.notebooks.length - previousData.notebooks.length;
    let bookmarkedNum = (updatedData.bookmarked ? 1 : 0) - (previousData.bookmarked ? 1 : 0);
    let isStudiedNum = (updatedData.isStudied ? 1 : 0) - (previousData.isStudied ? 1 : 0);
    console.log("onCloseOpenNode", nodeId, updatedData.notebooks - previousData.notebooks);
    await updatesNodeViewers({
      nodeId,
      viewers,
      bookmarkedNum,
      isStudiedNum,
    });
  } catch (error) {
    console.log("error onNodeDeleted:", error);
  }
});

export const onNewOpenNode = functions.firestore.document("/userNodes/{id}").onCreate(async change => {
  try {
    const data = change.data();
    const nodeId = data.node;
    console.log("onCloseOpenNode", nodeId);
    await updatesNodeViewers({
      nodeId,
      viewers: 1,
    });
  } catch (error) {
    console.log("error onNodeDeleted:", error);
  }
});

exports.assignNodeContributorsInstitutionsStats = functions
  .runWith({ memory: "1GB", timeoutSeconds: 520 })
  .pubsub.schedule("every 25 hours")
  .timeZone("America/Detroit")
  .onRun(assignNodeContributorsInstitutionsStats);

exports.updateInstitutions = functions
  .runWith({ memory: "1GB", timeoutSeconds: 520 })
  .pubsub.schedule("every 25 hours")
  .timeZone("America/Detroit")
  .onRun(updateInstitutions);
