export const proposalSummariesGenerator = (proposal: any) => {
  const proposalSummaries: string[] = [];
  if (proposal.newChild) {
    proposalSummaries.push(
      "- Proposed new child node" +
      ("childType" in proposal && proposal.childType
        ? " of type " + proposal.childType + "."
        : ".")
    );
  }
  if (proposal.addedChoices) {
    proposalSummaries.push("- Added choices.");
  }
  if (proposal.deletedChoices) {
    proposalSummaries.push("- Deleted choices.");
  }
  if (proposal.changedChoices) {
    proposalSummaries.push("- Changed choices.");
  }
  if (proposal.changedTitle) {
    proposalSummaries.push("- Changed title.");
  }
  if (proposal.changedContent) {
    proposalSummaries.push("- Changed content.");
  }
  if (proposal.addedImage) {
    proposalSummaries.push("- Added image.");
  }
  if (proposal.deletedImage) {
    proposalSummaries.push("- Deleted image.");
  }
  if (proposal.changedImage) {
    proposalSummaries.push("- Changed image.");
  }
  if (proposal.addedReferences) {
    proposalSummaries.push("- Added references.");
  }
  if (proposal.deletedReferences) {
    proposalSummaries.push("- Deleted references.");
  }
  if (proposal.changedReferences) {
    proposalSummaries.push("- Changed references.");
  }
  if (proposal.addedTags) {
    proposalSummaries.push("- Added tags.");
  }
  if (proposal.deletedTags) {
    proposalSummaries.push("- Deleted tags.");
  }
  if (proposal.changedTags) {
    proposalSummaries.push("- Changed tags.");
  }
  if (proposal.addedParents) {
    proposalSummaries.push("- Added Parents.");
  }
  if (proposal.addedChildren) {
    proposalSummaries.push("- Added Children.");
  }
  if (proposal.removedParents) {
    proposalSummaries.push("- Deleted Parents.");
  }
  if (proposal.removedChildren) {
    proposalSummaries.push("- Deleted Children.");
  }
  return proposalSummaries;
}

// TEST: implement test to this function