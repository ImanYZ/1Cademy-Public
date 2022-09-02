import { checkRestartBatchWriteCounts, db } from "../lib/firestoreServer/admin";

export const updateUserImageInCollection = async ({
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
  writeCounts,
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
