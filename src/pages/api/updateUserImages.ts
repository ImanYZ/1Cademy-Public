import { NextApiRequest, NextApiResponse } from "next";

import { admin, checkRestartBatchWriteCounts, commitBatch, db } from "../../lib/firestoreServer/admin";
import { comPointTypes, getTypedCollections, NODE_TYPES, retrieveAndsignalAllUserNodesChanges, schoolPointTypes } from '../../utils';

const updateUserImageInCollection = async ({
  batch,
  collQuery,
  collectionName,
  userAttribute,
  forAdmin,
  uname,
  imageUrl,
  fullname,
  chooseUname,
  currentTimestamp,
  writeCounts
}: any) => {
  let newBatch = batch;
  let cQuery;
  if (collQuery !== false) {
    cQuery = collQuery.where(userAttribute, "==", uname);
  } else {
    cQuery = db.collection(collectionName).where(userAttribute, "==", uname);
  }
  const docs = await cQuery.get();
  let cRef;
  for (let doc of docs.docs) {
    if (collQuery !== false) {
      cRef = collQuery.doc(doc.id);
    } else {
      cRef = db.collection(collectionName).doc(doc.id);
    }
    let dataObj: any = {
      imageUrl,
      fullname,
      chooseUname,
    };
    if (forAdmin) {
      dataObj = {
        aImgUrl: imageUrl,
        aFullname: fullname,
        aChooseUname: chooseUname,
      };
    }
    dataObj.updatedAt = currentTimestamp;
    newBatch.update(cRef, dataObj);
    [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
  }
  return [newBatch, writeCounts];
};

const updateUserImageEverywhere = async ({
  batch,
  uname,
  imageUrl,
  fullname,
  chooseUname,
  currentTimestamp,
  writeCounts
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
    writeCounts
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
    writeCounts
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
    writeCounts
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
    writeCounts
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
      writeCounts: writeCounts
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
      writeCounts
    });
  }
  for (let nodeType of NODE_TYPES) {
    const { versionsColl, versionsCommentsColl } = getTypedCollections(nodeType);
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
      writeCounts
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
      writeCounts
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
      writeCounts
    });
  }
  return [newBatch, writeCounts];
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let batch = db.batch();
    let writeCounts = 0;

    const currentTimestamp = admin.firestore.Timestamp.fromDate(new Date());
    const usersDocs = await db.collection("users").get();
    for (let userDoc of usersDocs.docs) {
      const userData = userDoc.data();
      const uname = userData.uname;
      console.log(uname);
      const imageUrl = userData.imageUrl;
      // It generates false or the value of the attribute.
      const chooseUname = "chooseUname" in userData && userData.chooseUname;
      [batch, writeCounts] = await updateUserImageEverywhere({
        batch,
        uname,
        imageUrl,
        fullname: userData.fName + " " + userData.lName,
        chooseUname,
        currentTimestamp,
        writeCounts
      });
    }
    await commitBatch(batch);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err, success: false });
  }
}

export default handler;