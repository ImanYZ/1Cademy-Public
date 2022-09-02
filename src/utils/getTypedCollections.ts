import { db } from "../lib/firestoreServer/admin";

export const getTypedCollections = ({ nodeType }: any) => {
  let versionsColl, userVersionsColl, versionsCommentsColl, userVersionsCommentsColl;
  if (nodeType === "Concept") {
    versionsColl = db.collection("conceptVersions");
    userVersionsColl = db.collection("userConceptVersions");
    versionsCommentsColl = db.collection("conceptVersionComments");
    userVersionsCommentsColl = db.collection("userConceptVersionComments");
  } else if (nodeType === "Code") {
    versionsColl = db.collection("codeVersions");
    userVersionsColl = db.collection("userCodeVersions");
    versionsCommentsColl = db.collection("codeVersionComments");
    userVersionsCommentsColl = db.collection("userCodeVersionComments");
  } else if (nodeType === "Relation") {
    versionsColl = db.collection("relationVersions");
    userVersionsColl = db.collection("userRelationVersions");
    versionsCommentsColl = db.collection("relationVersionComments");
    userVersionsCommentsColl = db.collection("userRelationVersionComments");
  } else if (nodeType === "Question") {
    versionsColl = db.collection("questionVersions");
    userVersionsColl = db.collection("userQuestionVersions");
    versionsCommentsColl = db.collection("questionVersionComments");
    userVersionsCommentsColl = db.collection("userQuestionVersionComments");
  } else if (nodeType === "Profile") {
    versionsColl = db.collection("profileVersions");
    userVersionsColl = db.collection("userProfileVersions");
    versionsCommentsColl = db.collection("profileVersionComments");
    userVersionsCommentsColl = db.collection("userProfileVersionComments");
  } else if (nodeType === "Sequel") {
    versionsColl = db.collection("sequelVersions");
    userVersionsColl = db.collection("userSequelVersions");
    versionsCommentsColl = db.collection("sequelVersionComments");
    userVersionsCommentsColl = db.collection("userSequelVersionComments");
  } else if (nodeType === "Advertisement") {
    versionsColl = db.collection("advertisementVersions");
    userVersionsColl = db.collection("userAdvertisementVersions");
    versionsCommentsColl = db.collection("advertisementVersionComments");
    userVersionsCommentsColl = db.collection("userAdvertisementVersionComments");
  } else if (nodeType === "Reference") {
    versionsColl = db.collection("referenceVersions");
    userVersionsColl = db.collection("userReferenceVersions");
    versionsCommentsColl = db.collection("referenceVersionComments");
    userVersionsCommentsColl = db.collection("userReferenceVersionComments");
  } else if (nodeType === "News") {
    versionsColl = db.collection("newsVersions");
    userVersionsColl = db.collection("userNewsVersions");
    versionsCommentsColl = db.collection("newsVersionComments");
    userVersionsCommentsColl = db.collection("userNewsVersionComments");
  } else if (nodeType === "Idea") {
    versionsColl = db.collection("ideaVersions");
    userVersionsColl = db.collection("userIdeaVersions");
    versionsCommentsColl = db.collection("ideaVersionComments");
    userVersionsCommentsColl = db.collection("userIdeaVersionComments");
  } else if (nodeType === "Private") {
    versionsColl = db.collection("privateVersions");
    userVersionsColl = db.collection("userPrivateVersions");
    versionsCommentsColl = db.collection("privateVersionComments");
    userVersionsCommentsColl = db.collection("userPrivateVersionComments");
  }
  return {
    versionsColl,
    userVersionsColl,
    versionsCommentsColl,
    userVersionsCommentsColl,
  };
};
