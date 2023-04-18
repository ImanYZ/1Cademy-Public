import { NodeFireStore } from "./types";

export const getNodeReferences = (nodeData: NodeFireStore) => {
  const references: { node: string; title?: string; label: string }[] = [];
  if (!nodeData.references || nodeData.references.length === 0) {
    return [];
  }
  //The "references" field in the DB can be an array ofra objects or an array of strings
  if (typeof (nodeData.references || [])[0] !== "object") {
    //In this case the field is an array of strings
    const referenceIds = nodeData.referenceIds || [];
    for (let refIdx = 0; refIdx < referenceIds.length; refIdx++) {
      const referenceLabels = nodeData.referenceLabels || [];
      references.push({
        node: referenceIds[refIdx],
        title: (nodeData.references as string[])[refIdx],
        label: referenceLabels[refIdx] || "",
      });
    }
  } else {
    //In this case the field is an array of objects
    const referencesField = nodeData.references as {
      node: string;
      title?: string;
      label: string;
    }[];
    for (let reference of referencesField) {
      if (reference.node && reference.title) {
        references.push({
          node: reference.node,
          title: reference.title,
          label: reference.label,
        });
      }
    }
  }
  return references;
};

export const getTypedCollections = (nodeType: any) => {
  let versionsColl;
  let userVersionsColl;
  let versionsCommentsColl;
  let userVersionsCommentsColl;

  if (nodeType === "Concept") {
    versionsColl = "conceptVersions";
    userVersionsColl = "userConceptVersions";
    versionsCommentsColl = "conceptVersionComments";
    userVersionsCommentsColl = "userConceptVersionComments";
  } else if (nodeType === "Code") {
    versionsColl = "codeVersions";
    userVersionsColl = "userCodeVersions";
    versionsCommentsColl = "codeVersionComments";
    userVersionsCommentsColl = "userCodeVersionComments";
  } else if (nodeType === "Relation") {
    versionsColl = "relationVersions";
    userVersionsColl = "userRelationVersions";
    versionsCommentsColl = "relationVersionComments";
    userVersionsCommentsColl = "userRelationVersionComments";
  } else if (nodeType === "Question") {
    versionsColl = "questionVersions";
    userVersionsColl = "userQuestionVersions";
    versionsCommentsColl = "questionVersionComments";
    userVersionsCommentsColl = "userQuestionVersionComments";
  } else if (nodeType === "Reference") {
    versionsColl = "referenceVersions";
    userVersionsColl = "userReferenceVersions";
    versionsCommentsColl = "referenceVersionComments";
    userVersionsCommentsColl = "userReferenceVersionComments";
  } else if (nodeType === "Idea") {
    versionsColl = "ideaVersions";
    userVersionsColl = "userIdeaVersions";
    versionsCommentsColl = "ideaVersionComments";
    userVersionsCommentsColl = "userIdeaVersionComments";
  } else if (nodeType === "Profile") {
    versionsColl = "profileVersions";
    userVersionsColl = "userProfileVersions";
    versionsCommentsColl = "profileVersionComments";
    userVersionsCommentsColl = "userProfileVersionComments";
  } else if (nodeType === "Sequel") {
    versionsColl = "sequelVersions";
    userVersionsColl = "userSequelVersions";
    versionsCommentsColl = "sequelVersionComments";
    userVersionsCommentsColl = "userSequelVersionComments";
  } else if (nodeType === "Advertisement") {
    versionsColl = "advertisementVersions";
    userVersionsColl = "userAdvertisementVersions";
    versionsCommentsColl = "advertisementVersionComments";
    userVersionsCommentsColl = "userAdvertisementVersionComments";
  } else if (nodeType === "News") {
    versionsColl = "newsVersions";
    userVersionsColl = "userNewsVersions";
    versionsCommentsColl = "newsVersionComments";
    userVersionsCommentsColl = "userNewsVersionComments";
  } else if (nodeType === "Private") {
    versionsColl = "privateVersions";
    userVersionsColl = "userPrivateVersions";
    versionsCommentsColl = "privateVersionComments";
    userVersionsCommentsColl = "userPrivateVersionComments";
  }
  return {
    versionsColl,
    userVersionsColl,
    versionsCommentsColl,
    userVersionsCommentsColl,
  };
};
