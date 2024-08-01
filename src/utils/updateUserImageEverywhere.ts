import { checkRestartBatchWriteCounts, commitBatch, db } from "../lib/firestoreServer/admin";
import {
  comPointTypes,
  getTypedCollections,
  NODE_TYPES,
  retrieveAndSignalAllUserNodesChanges,
  schoolPointTypes,
  updateUserImageInCollection,
} from ".";
import { detach } from "./helpers";
import { Timestamp } from "firebase-admin/firestore";
import { INotebook } from "src/types/INotebook";

export const updateUserImageEverywhere = async ({
  batch,
  uname,
  imageUrl,
  fullname,
  chooseUname,
  currentTimestamp,
  writeCounts,
}: any) => {
  let newBatch = batch;

  // updating imageUrl, fullname and chooseUname
  // TODO: move these to queue
  await detach(async () => {
    let batch = db.batch();
    let writeCounts = 0;

    const currentTime = new Date().getTime();
    const actionTracks = await db
      .collection("actionTracks")
      .where("uname", "==", uname)
      .where("createdAt", ">=", Timestamp.fromDate(new Date(currentTime - 93600000)))
      .get();
    for (const actionTrack of actionTracks.docs) {
      const actionTrackRef = db.collection("actionTracks").doc(actionTrack.id);
      batch.update(actionTrackRef, {
        imageUrl,
        chooseUname,
        fullname,
      });
      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
    }

    await commitBatch(batch);
  });

  // update notebooks collection
  await detach(async () => {
    let batch = db.batch();
    let writeCounts = 0;

    const ownedNotebooks = await db.collection("notebooks").where("owner", "==", uname).get();
    for (const ownedNotebook of ownedNotebooks.docs) {
      const notebookRef = db.collection("notebooks").doc(ownedNotebook.id);
      batch.update(notebookRef, {
        ownerImgUrl: imageUrl,
        ownerChooseUname: chooseUname,
        ownerFullName: fullname,
      });
      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
    }

    const allowedNotebooks = await db.collection("notebooks").where("users", "array-contains", uname).get();
    for (const allowedNotebook of allowedNotebooks.docs) {
      const notebookRef = db.collection("notebooks").doc(allowedNotebook.id);
      const notebookData = allowedNotebook.data() as INotebook;
      notebookData.usersInfo[uname] = {
        chooseUname,
        fullname,
        imageUrl,
        role: notebookData.usersInfo?.[uname]?.role || "viewer",
      };
      batch.update(notebookRef, {
        usersInfo: notebookData.usersInfo,
      });
      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
    }

    await commitBatch(batch);
  });

  [newBatch, writeCounts] = await updateUserImageInCollection({
    batch: newBatch,
    collQuery: false,
    collectionName: "nodeComments",
    userAttribute: "author",
    forAdmin: false,
    uname,
    imageUrl,
    fullname,
    chooseUname,
    currentTimestamp,
    writeCounts,
  });
  [newBatch, writeCounts] = await updateUserImageInCollection({
    batch: newBatch,
    collQuery: false,
    collectionName: "messages",
    userAttribute: "username",
    forAdmin: false,
    uname,
    imageUrl,
    fullname,
    chooseUname,
    currentTimestamp,
    writeCounts,
  });
  [newBatch, writeCounts] = await updateUserImageInCollection({
    batch: newBatch,
    collQuery: false,
    collectionName: "notifications",
    userAttribute: "uname",
    forAdmin: false,
    uname,
    imageUrl,
    fullname,
    chooseUname,
    currentTimestamp,
    writeCounts,
  });
  [newBatch, writeCounts] = await updateUserImageInCollection({
    batch: newBatch,
    collQuery: false,
    collectionName: "presentations",
    userAttribute: "uname",
    forAdmin: false,
    uname,
    imageUrl,
    fullname,
    chooseUname,
    currentTimestamp,
    writeCounts,
  });
  for (let comType of comPointTypes) {
    [newBatch, writeCounts] = await updateUserImageInCollection({
      batch: newBatch,
      collQuery: false,
      collectionName: comType,
      userAttribute: "admin",
      forAdmin: true,
      uname,
      imageUrl,
      fullname,
      chooseUname,
      currentTimestamp,
      writeCounts: writeCounts,
    });
  }
  for (let schoolType of schoolPointTypes) {
    [newBatch, writeCounts] = await updateUserImageInCollection({
      batch: newBatch,
      collQuery: false,
      collectionName: schoolType,
      userAttribute: "admin",
      forAdmin: true,
      uname: uname,
      imageUrl,
      fullname,
      chooseUname,
      currentTimestamp,
      writeCounts,
    });
  }

  const { versionsColl, versionsCommentsColl } = getTypedCollections();
  [newBatch, writeCounts] = await updateUserImageInCollection({
    batch: newBatch,
    collQuery: versionsColl,
    collectionName: "versions",
    userAttribute: "proposer",
    forAdmin: false,
    uname: uname,
    imageUrl,
    fullname,
    chooseUname,
    currentTimestamp,
    writeCounts,
  });
  [newBatch, writeCounts] = await updateUserImageInCollection({
    batch: newBatch,
    collQuery: versionsCommentsColl,
    collectionName: "versionComments",
    userAttribute: "author",
    forAdmin: false,
    uname: uname,
    imageUrl,
    fullname,
    chooseUname,
    currentTimestamp,
    writeCounts,
  });

  const nodesDocs = await db.collection("nodes").where("admin", "==", uname).get();
  for (let nodeDoc of nodesDocs.docs) {
    const nodeRef = db.collection("nodes").doc(nodeDoc.id);
    const nodeChanges = {
      aImgUrl: imageUrl,
      aFullname: fullname,
      aChooseUname: chooseUname,
      updatedAt: currentTimestamp,
    };
    newBatch.update(nodeRef, nodeChanges);
    [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
    [newBatch, writeCounts] = await retrieveAndSignalAllUserNodesChanges({
      batch: newBatch,
      linkedId: nodeDoc.id,
      nodeChanges,
      major: false,
      currentTimestamp,
      writeCounts,
    });
  }
  return [newBatch, writeCounts];
};
