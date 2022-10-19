import { collection, Firestore } from "firebase/firestore";

import { NodeType } from "../../types";

export const getTypedCollections = (db: Firestore, nodeType: NodeType) => {
  let versionsColl;
  let userVersionsColl;
  let versionsCommentsColl;
  let userVersionsCommentsColl;

  if (nodeType === "Concept") {
    versionsColl = collection(db, "conceptVersions");
    userVersionsColl = collection(db, "userConceptVersions");
    versionsCommentsColl = collection(db, "conceptVersionComments");
    userVersionsCommentsColl = collection(db, "userConceptVersionComments");
  } else if (nodeType === "Code") {
    versionsColl = collection(db, "codeVersions");
    userVersionsColl = collection(db, "userCodeVersions");
    versionsCommentsColl = collection(db, "codeVersionComments");
    userVersionsCommentsColl = collection(db, "userCodeVersionComments");
  } else if (nodeType === "Relation") {
    versionsColl = collection(db, "relationVersions");
    userVersionsColl = collection(db, "userRelationVersions");
    versionsCommentsColl = collection(db, "relationVersionComments");
    userVersionsCommentsColl = collection(db, "userRelationVersionComments");
  } else if (nodeType === "Question") {
    versionsColl = collection(db, "questionVersions");
    userVersionsColl = collection(db, "userQuestionVersions");
    versionsCommentsColl = collection(db, "questionVersionComments");
    userVersionsCommentsColl = collection(db, "userQuestionVersionComments");
  } else if (nodeType === "Reference") {
    versionsColl = collection(db, "referenceVersions");
    userVersionsColl = collection(db, "userReferenceVersions");
    versionsCommentsColl = collection(db, "referenceVersionComments");
    userVersionsCommentsColl = collection(db, "userReferenceVersionComments");
  } else if (nodeType === "Idea") {
    versionsColl = collection(db, "ideaVersions");
    userVersionsColl = collection(db, "userIdeaVersions");
    versionsCommentsColl = collection(db, "ideaVersionComments");
    userVersionsCommentsColl = collection(db, "userIdeaVersionComments");
    // } else if (nodeType === "Profile") {
    //   versionsColl = collection(db, "profileVersions");
    //   userVersionsColl = collection(db, "userProfileVersions");
    //   versionsCommentsColl = collection(db, "profileVersionComments");
    //   userVersionsCommentsColl = collection(db, "userProfileVersionComments");
    // } else if (nodeType === "Sequel") {
    //   versionsColl = collection(db, "sequelVersions");
    //   userVersionsColl = collection(db, "userSequelVersions");
    //   versionsCommentsColl = collection(db, "sequelVersionComments");
    //   userVersionsCommentsColl = collection(db, "userSequelVersionComments");
    // } else if (nodeType === "Advertisement") {
    versionsColl = collection(db, "advertisementVersions");
    userVersionsColl = collection(db, "userAdvertisementVersions");
    versionsCommentsColl = collection(db, "advertisementVersionComments");
    userVersionsCommentsColl = collection(db, "userAdvertisementVersionComments");
  } else if (nodeType === "News") {
    versionsColl = collection(db, "newsVersions");
    userVersionsColl = collection(db, "userNewsVersions");
    versionsCommentsColl = collection(db, "newsVersionComments");
    userVersionsCommentsColl = collection(db, "userNewsVersionComments");
  } else if (nodeType === "Private") {
    versionsColl = collection(db, "privateVersions");
    userVersionsColl = collection(db, "userPrivateVersions");
    versionsCommentsColl = collection(db, "privateVersionComments");
    userVersionsCommentsColl = collection(db, "userPrivateVersionComments");
  }
  return {
    versionsColl,
    userVersionsColl,
    versionsCommentsColl,
    userVersionsCommentsColl,
  };
};

// export const getTypedCollections = (db, nodeType) => {
//   let versionsColl,
//     userVersionsColl,
//     versionsCommentsColl,
//     userVersionsCommentsColl;
//   if (nodeType === "Concept") {
//     versionsColl = db.collection("conceptVersions");
//     userVersionsColl = db.collection("userConceptVersions");
//     versionsCommentsColl = db.collection("conceptVersionComments");
//     userVersionsCommentsColl = db.collection("userConceptVersionComments");
//   } else if (nodeType === "Code") {
//     versionsColl = db.collection("codeVersions");
//     userVersionsColl = db.collection("userCodeVersions");
//     versionsCommentsColl = db.collection("codeVersionComments");
//     userVersionsCommentsColl = db.collection("userCodeVersionComments");
//   } else if (nodeType === "Relation") {
//     versionsColl = db.collection("relationVersions");
//     userVersionsColl = db.collection("userRelationVersions");
//     versionsCommentsColl = db.collection("relationVersionComments");
//     userVersionsCommentsColl = db.collection("userRelationVersionComments");
//   } else if (nodeType === "Question") {
//     versionsColl = db.collection("questionVersions");
//     userVersionsColl = db.collection("userQuestionVersions");
//     versionsCommentsColl = db.collection("questionVersionComments");
//     userVersionsCommentsColl = db.collection("userQuestionVersionComments");
//   } else if (nodeType === "Reference") {
//     versionsColl = db.collection("referenceVersions");
//     userVersionsColl = db.collection("userReferenceVersions");
//     versionsCommentsColl = db.collection("referenceVersionComments");
//     userVersionsCommentsColl = db.collection("userReferenceVersionComments");
//   } else if (nodeType === "Idea") {
//     versionsColl = db.collection("ideaVersions");
//     userVersionsColl = db.collection("userIdeaVersions");
//     versionsCommentsColl = db.collection("ideaVersionComments");
//     userVersionsCommentsColl = db.collection("userIdeaVersionComments");
//   } else if (nodeType === "Profile") {
//     versionsColl = db.collection("profileVersions");
//     userVersionsColl = db.collection("userProfileVersions");
//     versionsCommentsColl = db.collection("profileVersionComments");
//     userVersionsCommentsColl = db.collection("userProfileVersionComments");
//   } else if (nodeType === "Sequel") {
//     versionsColl = db.collection("sequelVersions");
//     userVersionsColl = db.collection("userSequelVersions");
//     versionsCommentsColl = db.collection("sequelVersionComments");
//     userVersionsCommentsColl = db.collection("userSequelVersionComments");
//   } else if (nodeType === "Advertisement") {
//     versionsColl = db.collection("advertisementVersions");
//     userVersionsColl = db.collection("userAdvertisementVersions");
//     versionsCommentsColl = db.collection("advertisementVersionComments");
//     userVersionsCommentsColl = db.collection(
//       "userAdvertisementVersionComments"
//     );
//   } else if (nodeType === "News") {
//     versionsColl = db.collection("newsVersions");
//     userVersionsColl = db.collection("userNewsVersions");
//     versionsCommentsColl = db.collection("newsVersionComments");
//     userVersionsCommentsColl = db.collection("userNewsVersionComments");
//   } else if (nodeType === "Private") {
//     versionsColl = db.collection("privateVersions");
//     userVersionsColl = db.collection("userPrivateVersions");
//     versionsCommentsColl = db.collection("privateVersionComments");
//     userVersionsCommentsColl = db.collection("userPrivateVersionComments");
//   }
//   return {
//     versionsColl,
//     userVersionsColl,
//     versionsCommentsColl,
//     userVersionsCommentsColl,
//   };
// };
