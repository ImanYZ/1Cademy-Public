import { admin, checkRestartBatchWriteCounts, commitBatch, db } from "../lib/firestoreServer/admin";
import {
  comPointTypes,
  getTypedCollections,
  NODE_TYPES,
  reputationTypes,
  retrieveAndsignalAllUserNodesChanges,
  schoolPointTypes,
} from ".";

const replaceUnameInCollection = async ({
  batch,
  collQuery,
  collectionName,
  columnName,
  oldUname,
  newUname,
  writeCounts,
}: any) => {
  let newBatch = batch;
  let docsQuery;

  if (collQuery !== false) {
    docsQuery = collQuery.where(columnName, "==", oldUname);
  } else {
    docsQuery = db.collection(collectionName).where(columnName, "==", oldUname);
  }
  const docsDocs = await docsQuery.get();
  let docRef;
  for (let docDoc of docsDocs.docs) {
    if (collQuery !== false) {
      docRef = collQuery.doc(docDoc.id);
    } else {
      docRef = db.collection(collectionName).doc(docDoc.id);
    }
    newBatch.update(docRef, { [columnName]: newUname });
    [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
  }
  return [newBatch, writeCounts];
};

export const replaceUsername = async ({ userDoc, newUsername }: any) => {
  let writeCounts = 0;
  let batch = db.batch();
  const uname = userDoc.id;
  const userData = userDoc.data();
  let userRef = db.collection("users").doc(newUsername);
  batch.set(userRef, { ...userData, uname: newUsername });
  writeCounts += 1;

  userRef = db.collection("users").doc(uname);
  batch.delete(userRef);
  writeCounts += 1;
  console.log(uname + " to " + newUsername);

  for (let nodeType of NODE_TYPES) {
    const { versionsColl, userVersionsColl, versionsCommentsColl, userVersionsCommentsColl } = getTypedCollections({
      nodeType,
    });
    [batch, writeCounts] = await replaceUnameInCollection({
      batch,
      collQuery: versionsColl,
      collectionName: nodeType + "Versions",
      columnName: "proposer",
      oldUname: uname,
      newUname: newUsername,
      writeCounts,
    });
    [batch, writeCounts] = await replaceUnameInCollection({
      batch,
      collQuery: userVersionsColl,
      collectionName: nodeType + "Versions",
      columnName: "user",
      oldUname: uname,
      newUname: newUsername,
      writeCounts,
    });
    [batch, writeCounts] = await replaceUnameInCollection({
      batch,
      collQuery: versionsCommentsColl,
      collectionName: nodeType + "Versions",
      columnName: "author",
      oldUname: uname,
      newUname: newUsername,
      writeCounts,
    });
    [batch, writeCounts] = await replaceUnameInCollection({
      batch,
      collQuery: userVersionsCommentsColl,
      collectionName: nodeType + "Versions",
      columnName: "user",
      oldUname: uname,
      newUname: newUsername,
      writeCounts,
    });
  }

  for (let collName of [
    "userVersionsLog",
    "practice",
    "practiceCompletion",
    "practiceLog",
    "userNodes",
    "userNodesLog",
  ]) {
    [batch, writeCounts] = await replaceUnameInCollection({
      batch,
      collQuery: false,
      collectionName: collName,
      columnName: "user",
      oldUname: uname,
      newUname: newUsername,
      writeCounts: writeCounts,
    });
  }
  const collNamesWithAdmin = [...comPointTypes, ...schoolPointTypes];
  for (let collName of collNamesWithAdmin) {
    [batch, writeCounts] = await replaceUnameInCollection({
      batch,
      collQuery: false,
      collectionName: collName,
      columnName: "admin",
      oldUname: uname,
      newUname: newUsername,
      writeCounts,
    });
  }
  const collNamesWithUname = [
    ...reputationTypes,
    "notifications",
    "presNodes",
    "presentations",
    "userBackgroundLog",
    "userClosedSidebarLog",
    "userClustersLog",
    "userLeaderboardLog",
    "userComLeaderboardLog",
    "userNodePartsLog",
    "userNodeSelectLog",
    "userOpenSidebarLog",
    "userSearchLog",
    "userThemeLog",
    "userUserInfoLog",
    "userUsersStatusLog",
  ];
  for (let collName of collNamesWithUname) {
    [batch, writeCounts] = await replaceUnameInCollection({
      batch,
      collQuery: false,
      collectionName: collName,
      columnName: "uname",
      oldUname: uname,
      newUname: newUsername,
      writeCounts,
    });
  }
  [batch, writeCounts] = await replaceUnameInCollection({
    batch,
    collQuery: false,
    collectionName: "messages",
    columnName: "username",
    oldUname: uname,
    newUname: newUsername,
    writeCounts,
  });
  [batch, writeCounts] = await replaceUnameInCollection({
    batch,
    collQuery: false,
    collectionName: "notifications",
    columnName: "proposer",
    oldUname: uname,
    newUname: newUsername,
    writeCounts,
  });
  [batch, writeCounts] = await replaceUnameInCollection({
    batch,
    collQuery: false,
    collectionName: "userUserInfoLog",
    columnName: "uInfo",
    oldUname: uname,
    newUname: newUsername,
    writeCounts,
  });

  try {
    const currentTimestamp = admin.firestore.Timestamp.fromDate(new Date());
    const nodesDocs = await db.collection("nodes").where("admin", "==", uname).get();
    for (let nodeDoc of nodesDocs.docs) {
      const nodeRef = db.collection("nodes").doc(nodeDoc.id);
      const nodeChanges = {
        admin: newUsername,
        updatedAt: currentTimestamp,
      };
      batch.update(nodeRef, nodeChanges);
      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
      [batch, writeCounts] = await retrieveAndsignalAllUserNodesChanges({
        batch,
        linkedId: nodeDoc.id,
        nodeChanges,
        major: false,
        currentTimestamp,
        writeCounts,
      });
    }
  } catch (err) {
    console.log({ err });
  }
  // We don't have this in the front-end anymore!
  await commitBatch(batch);
  try {
    await admin.auth().updateUser(userData.userId, {
      displayName: newUsername,
    });
  } catch (err) {
    console.log({ err });
  }
};
