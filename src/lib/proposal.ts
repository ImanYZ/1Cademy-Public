import { ProposalInput } from "../knowledgeTypes";

export const buildProposal = ({
  children,
  choices,
  content,
  node,
  parents,
  referenceIds,
  referenceLabels,
  references,
  proposal,
  tagIds,
  tags,
  title,
  nodeType,
}: ProposalInput) => {
  return {
    accepted: false,
    awards: 0,
    children, // FORM
    choices, // FORM
    chooseUname: false,
    content, // FORM
    contributors: [],
    corrects: 0,
    createdAt: new Date(),
    deleted: false,
    fullname: null,
    imageUrl: null,
    institutions: [],
    newChild: false, // IF THEY PROPOSE A NEW NODE, true; IF THEY PROPOSE AN IMPROVEMENT TO AN EXISTING NODE, false.
    node, // FORM: THE ID OF THE NODE WHERE THEY PROPOSE THIS IMPROVEMENT
    nodeImage: "", // UNAUTHENTICATED USER CANT UPLOAD IMAGES
    parents, // FORM
    referenceIds, // FORM
    referenceLabels, // FORM
    references, // FORM
    proposal, // FORM: REASONING FOR WHY THEY PROPOSE THIS CHANGE.
    tagIds, // FORM
    tags, // FORM
    title, // FORM
    updatedAt: new Date(),
    viewers: 0,
    wrongs: 0,
    nodeType,
  };
};
