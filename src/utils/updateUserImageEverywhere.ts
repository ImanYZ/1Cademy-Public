import { checkRestartBatchWriteCounts, db } from "../lib/firestoreServer/admin";
import {
  comPointTypes,
  getTypedCollections,
  NODE_TYPES,
  retrieveAndsignalAllUserNodesChanges,
  schoolPointTypes,
  updateUserImageInCollection,
} from ".";

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
  for (let nodeType of NODE_TYPES) {
    const { versionsColl, versionsCommentsColl } = getTypedCollections({ nodeType });
    [newBatch, writeCounts] = await updateUserImageInCollection({
      batch: newBatch,
      collQuery: versionsColl,
      collectionName: nodeType + "Versions",
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
      collectionName: nodeType + "versionComments",
      userAttribute: "author",
      forAdmin: false,
      uname: uname,
      imageUrl,
      fullname,
      chooseUname,
      currentTimestamp,
      writeCounts,
    });
  }
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
    [newBatch, writeCounts] = await retrieveAndsignalAllUserNodesChanges({
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
