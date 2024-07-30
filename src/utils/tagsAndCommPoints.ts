import { DocumentReference, DocumentSnapshot, Transaction } from "firebase-admin/firestore";
import { db } from "../lib/firestoreServer/admin";
import { convertToTGet } from "./";
import { ITag } from "src/types/ITag";
export const comPointTypes = [
  "tags",
  "comPoints",
  "comMonthlyPoints",
  "comWeeklyPoints",
  "comOthersPoints",
  "comOthMonPoints",
  "comOthWeekPoints",
];

const tagCommunityFunctionOrPromise = async ({
  collectionName,
  tagRef,
  tagDoc,
  tagData,
  callBack,
}: {
  collectionName: string;
  tagRef: DocumentReference;
  tagDoc: DocumentSnapshot | null;
  tagData: ITag | null;
  callBack: any;
}) => {
  const result = callBack({ collectionName, tagRef, tagDoc, tagData });

  if (result instanceof Promise) {
    await result;
  } else {
    return result;
  }
};

export const tagsAndCommPoints = async ({
  nodeId,
  callBack,
  t,
}: {
  nodeId: string;
  callBack: ({
    collectionName,
    tagRef,
    tagDoc,
    tagData,
  }: {
    collectionName: string;
    tagRef: DocumentReference;
    tagDoc: DocumentSnapshot;
    tagData: ITag;
  }) => Promise<any>;
  t?: Transaction | null;
}) => {
  // Names of the collections to iterate through.
  for (let collectionName of comPointTypes) {
    const tagDocs = await convertToTGet(
      db.collection(collectionName).where(collectionName === "tags" ? "node" : "tagId", "==", nodeId),
      t || null
    );
    for (let tagDoc of tagDocs.docs) {
      const tagData = tagDoc.data();
      const tagRef = db.collection(collectionName).doc(tagDoc.id);
      await tagCommunityFunctionOrPromise({ collectionName, tagRef, tagDoc, tagData, callBack });
    }
    if (tagDocs.docs.length === 0) {
      const tagRef = db.collection(collectionName).doc();
      await tagCommunityFunctionOrPromise({ collectionName, tagRef, tagDoc: null, tagData: null, callBack });
    }
  }
};
