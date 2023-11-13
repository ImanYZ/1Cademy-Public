import { batchUpdate, commitBatch } from "../admin";
import { getTypedCollections } from "../helpers/getTypedCollections";
import { compareChoices, compareFlatLinks, compareLinks } from "../helpers/version-helpers";
type INodeDeletedUpdates = {
  nodeId: string;
  nodeData: any;
};
export const updateVersions = async ({ nodeId, nodeData }: INodeDeletedUpdates) => {
  const nodeType = nodeData.nodeType;
  const { versionsColl }: any = getTypedCollections({ nodeType });
  const versionsDocs = await versionsColl.where("node", "==", nodeId).get();

  // From here on, we specify the type of the changes that the user is proposing on this node
  // using some boolean fields to be added to the version.
  for (let versionDoc of versionsDocs.docs) {
    const versionData = versionDoc.data();
    if (versionData.newChild) continue;
    [
      "addedChoices",
      "deletedChoices",
      "changedChoices",
      "changedTitle",
      "changedContent",
      "addedImage",
      "deletedImage",
      "changedImage",
      "addedReferences",
      "deletedReferences",
      "changedReferences",
      "addedTags",
      "deletedTags",
      "changedTags",
      "addedParents",
      "addedChildren",
      "removedParents",
      "removedChildren",
      "changedNodeType",
    ].forEach(change => delete versionData[change]);

    const parentCompare = compareLinks({ oldLinks: nodeData.parents, newLinks: versionData.parents });
    const childCompare = compareLinks({ oldLinks: nodeData.children, newLinks: versionData.children });
    if (nodeType === "Question" && versionData.choices) {
      if (versionData?.choices?.length > nodeData?.choices?.length) {
        versionData.addedChoices = true;
      } else if (versionData?.choices?.length < nodeData?.choices?.length) {
        versionData.deletedChoices = true;
      }
      if (!compareChoices({ node1: versionData, node2: nodeData })) {
        versionData.changedChoices = true;
      }
    }

    if (versionData.title.trim() !== nodeData.title.trim()) {
      versionData.changedTitle = true;
    }
    if (versionData.content.trim() !== nodeData.content.trim()) {
      versionData.changedContent = true;
    }
    if (versionData.nodeImage !== "" && nodeData.nodeImage === "") {
      versionData.addedImage = true;
    } else if (versionData.nodeImage === "" && nodeData.nodeImage !== "") {
      versionData.deletedImage = true;
    } else if (versionData.nodeImage !== nodeData.nodeImage) {
      versionData.changedImage = true;
    }
    if (versionData.nodeVideo !== "" && nodeData.nodeVideo === "") {
      versionData.addedVideo = true;
    } else if (versionData.nodeVideo === "" && nodeData.nodeVideo !== "") {
      versionData.deletedVideo = true;
    } else if (versionData.nodeVideo !== nodeData.nodeVideo) {
      versionData.changedVideo = true;
    }
    if (versionData.nodeAudio !== "" && nodeData.nodeAudio === "") {
      versionData.addedAudio = true;
    } else if (versionData.nodeAudio === "" && nodeData.nodeAudio !== "") {
      versionData.deletedAudio = true;
    } else if (versionData.nodeAudio !== nodeData.nodeAudio) {
      versionData.changedAudio = true;
    }
    if (versionData.referenceIds.length > nodeData.referenceIds.length) {
      versionData.addedReferences = true;
    } else if (versionData.referenceIds.length < nodeData.referenceIds.length) {
      versionData.deletedReferences = true;
    }
    if (
      !compareFlatLinks({ links1: versionData.referenceIds, links2: nodeData.referenceIds }) ||
      !compareFlatLinks({ links1: versionData.referenceLabels, links2: nodeData.referenceLabels })
    ) {
      versionData.changedReferences = true;
    }
    if (versionData.tagIds.length > nodeData.tagIds.length) {
      versionData.addedTags = true;
    } else if (versionData.tagIds.length < nodeData.tagIds.length) {
      versionData.deletedTags = true;
    }
    if (!compareFlatLinks({ links1: versionData.tagIds, links2: nodeData.tagIds })) {
      versionData.changedTags = true;
    }
    if (parentCompare.addedLinks.length > 0) {
      versionData.addedParents = true;
    }
    if (childCompare.addedLinks.length > 0) {
      versionData.addedChildren = true;
    }
    if (parentCompare.removedLinks.length > 0) {
      versionData.removedParents = true;
    }
    if (childCompare.removedLinks.length > 0) {
      versionData.removedChildren = true;
    }
    batchUpdate(versionDoc.ref, versionData);
  }
  await commitBatch();
};
