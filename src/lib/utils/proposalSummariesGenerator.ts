export const proposalSummariesGenerator = (proposal: any) => {
  const proposalSummaries: string[] = [];
  if (proposal.newChild) {
    proposalSummaries.push(
      "- Proposes new child node" +
        ("childType" in proposal && proposal.childType ? " of type " + proposal.childType + "." : ".")
    );
  }
  if (proposal.addedChoices) {
    proposalSummaries.push("- Adds choices.");
  }
  if (proposal.deletedChoices) {
    proposalSummaries.push("- Deletes choices.");
  }
  if (proposal.changedChoices) {
    proposalSummaries.push("- Changes choices.");
  }
  if (proposal.changedTitle) {
    proposalSummaries.push("- Changes title.");
  }
  if (proposal.changedContent) {
    proposalSummaries.push("- Changes content.");
  }
  if (proposal.addedImage) {
    proposalSummaries.push("- Adds image.");
  }
  if (proposal.deletedImage) {
    proposalSummaries.push("- Deletes image.");
  }
  if (proposal.changedImage) {
    proposalSummaries.push("- Changes image.");
  }
  if (proposal.addedReferences) {
    proposalSummaries.push("- Adds references.");
  }
  if (proposal.deletedReferences) {
    proposalSummaries.push("- Deletes references.");
  }
  if (proposal.changedReferences) {
    proposalSummaries.push("- Changes references.");
  }
  if (proposal.addedTags) {
    proposalSummaries.push("- Adds tags.");
  }
  if (proposal.deletedTags) {
    proposalSummaries.push("- Deletes tags.");
  }
  if (proposal.changedTags) {
    proposalSummaries.push("- Changes tags.");
  }
  if (proposal.addedParents) {
    proposalSummaries.push("- Adds Parents.");
  }
  if (proposal.addedChildren) {
    proposalSummaries.push("- Adds Children.");
  }
  if (proposal.removedParents) {
    proposalSummaries.push("- Deletes Parents.");
  }
  if (proposal.removedChildren) {
    proposalSummaries.push("- Deletes Children.");
  }
  if (proposal.changedNodeType) {
    proposalSummaries.push("- Changes Node Type.");
  }
  return proposalSummaries;
};

// TEST: implement test to this function
