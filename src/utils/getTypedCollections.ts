import { CollectionReference, DocumentData, DocumentReference } from "firebase-admin/firestore";
import { db } from "../lib/firestoreServer/admin";
import { NodeType } from "../types";

type GetTypedCollectionsParam = { nodeType: NodeType };

export type GetTypedCollectionsReturn = {
  versionsColl: CollectionReference;
  userVersionsColl: CollectionReference;
  versionsCommentsColl: CollectionReference;
  userVersionsCommentsColl: CollectionReference;
};
export const VERSIONS: string = "versions";
export const USER_VERSIONS: string = "userVersions";
export const VERSIONS_COMMENTS: string = "versionComments";
export const USER_VERSIONS_COMMENTS: string = "userVersionComments";

export const getTypedCollections = (): GetTypedCollectionsReturn => {
  const versionsColl = db.collection(VERSIONS);
  const userVersionsColl = db.collection(USER_VERSIONS);
  const versionsCommentsColl = db.collection(VERSIONS_COMMENTS);
  const userVersionsCommentsColl = db.collection(USER_VERSIONS_COMMENTS);

  return {
    versionsColl,
    userVersionsColl,
    versionsCommentsColl,
    userVersionsCommentsColl,
  };
};
