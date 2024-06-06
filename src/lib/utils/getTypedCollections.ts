import { collection, Firestore } from "firebase/firestore";

import { USER_VERSIONS, USER_VERSIONS_COMMENTS, VERSIONS, VERSIONS_COMMENTS } from "./firebase.collections";

export const getCollectionsQuery = (db: Firestore) => {
  let versionsColl = collection(db, VERSIONS);
  let userVersionsColl = collection(db, USER_VERSIONS);
  let versionsCommentsColl = collection(db, VERSIONS_COMMENTS);
  let userVersionsCommentsColl = collection(db, USER_VERSIONS_COMMENTS);
  return {
    versionsColl,
    userVersionsColl,
    versionsCommentsColl,
    userVersionsCommentsColl,
  };
};
