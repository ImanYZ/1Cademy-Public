const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// Since this code will be running in the Cloud Functions environment
// we call initialize Firestore without any arguments because it
// detects authentication from the environment.
const firestore = admin.firestore();

exports.onUserStatusChanged = functions.database.ref("/status/{uname}").onUpdate(async (change, context) => {
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
      sessionIds.push(...userStatusData?.sessionIds);
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
