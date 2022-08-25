import {
  db,
} from "../lib/firestoreServer/admin";

const comPointTypes = [
  "comPoints",
  "comMonthlyPoints",
  "comWeeklyPoints",
  "comOthersPoints",
  "comOthMonPoints",
  "comOthWeekPoints",
];

const tagCommunityFunctionOrPromise = async ({ tagRef, tagDoc, tagData, callBack }: any) => {
  if (typeof callBack.then === "function") {
    await callBack({ tagRef, tagDoc, tagData });
  } else {
    callBack({ tagRef, tagDoc, tagData });
  }
};

export const tagsAndCommPoints = async ({ nodeId, callBack }: any) => {
  // Names of the collections to itterate through.
  const collectionNames = ["tags", ...comPointTypes];
  for (let collectionName of collectionNames) {
    const tagDocs = await db
      .collection(collectionName)
      .where(collectionName === "tags" ? "node" : "tagId", "==", nodeId)
      .get();
    for (let tagDoc of tagDocs.docs) {
      const tagData = tagDoc.data();
      const tagRef = db.collection(collectionName).doc(tagDoc.id);
      await tagCommunityFunctionOrPromise({ tagRef, tagDoc, tagData, callBack });
    }
    if (tagDocs.docs.length === 0) {
      const tagRef = db.collection(collectionName).doc();
      await tagCommunityFunctionOrPromise({ tagRef, tagDoc: null, tagData: null, callBack });
    }
  }
};