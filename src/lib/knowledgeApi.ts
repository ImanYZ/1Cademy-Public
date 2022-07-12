import axios from "axios";

import {
  FeedbackInput,
  FilterValue,
  KnowledgeNode,
  NodeType,
  ProposalInput,
  ResponseAutocompleteFilter,
  ResponseAutocompleteFullNodes,
  ResponseAutocompleteFullReferences,
  ResponseAutocompleteFullTag,
  ResponseAutocompleteProcessedReferencesFilter,
  ResponseAutocompleteSearch,
  ResponseAutocompleteTags,
  ResponseGeneric,
  SearchNodesParams,
  SearchNodesResponse,
  StatsSchema
} from "../knowledgeTypes";

export const getTagsAutocomplete = async (tagName: string): Promise<ResponseAutocompleteTags> => {
  const response = await axios.get("/api/tagsAutocomplete", { params: { q: tagName } });
  return response.data;
};

export const getInstitutionsAutocomplete = async (institutionName: string): Promise<ResponseAutocompleteFilter> => {
  const response = await axios.get("/api/institutionsAutocomplete", { params: { q: institutionName } });
  return response.data;
};

export const getContributorsAutocomplete = async (contributorName: string): Promise<ResponseAutocompleteFilter> => {
  const response = await axios.get("/api/contributorsAutocomplete", { params: { q: contributorName } });
  return response.data;
};

export const getReferencesAutocomplete = async (
  referenceSearch: string
): Promise<ResponseAutocompleteProcessedReferencesFilter> => {
  const response = await axios.get("/api/referencesAutocomplete", { params: { q: referenceSearch } });
  return response.data;
};

export const sendFeedback = async (data: FeedbackInput): Promise<any> => {
  await axios.post("/api/feedback", { data });
};

export const getStats = async () => {
  const response = await axios.get<StatsSchema>("/api/stats");
  return response.data;
};

export const getSearchNodes = async (options: SearchNodesParams) => {
  const { q, upvotes, mostRecent, timeWindow, tags, contributors, reference, label, nodeTypes, page, institutions } =
    options;
  const response = await axios.get<SearchNodesResponse>("/api/searchNodes", {
    params: { q, upvotes, mostRecent, timeWindow, tags, contributors, reference, label, nodeTypes, page, institutions }
  });
  return response.data;
};

export const getSelectedContributors = async (users: string) => {
  const response = await axios.get<FilterValue[]>("/api/getSelectedContributors", {
    params: { users }
  });
  return response.data;
};

export const getSelectedInstitutions = async (institutions: string) => {
  const response = await axios.get<FilterValue[]>("/api/getSelectedInstitutions", {
    params: { institutions }
  });
  return response.data;
};

export const getSearchAutocomplete = async (searchText: string): Promise<ResponseAutocompleteSearch> => {
  const response = await axios.get("/api/searchAutocomplete", { params: { q: searchText } });
  return response.data;
};

export const getNodeData = async (nodeId: string): Promise<KnowledgeNode> => {
  const res = await axios.post("/api/nodeData", { nodeId });
  if (!res?.data) {
    throw Error("invalid node");
  }

  return res.data.results;
};

export const getFullTagAutocomplete = async (searchText: string): Promise<ResponseAutocompleteFullTag> => {
  const response = await axios.get("/api/fullTagsAutocomplete", { params: { q: searchText } });
  return response.data;
};

export const getFullReferencesAutocomplete = async (
  searchText: string
): Promise<ResponseAutocompleteFullReferences> => {
  const response = await axios.get("/api/fullReferencesAutocomplete", { params: { q: searchText } });
  return response.data;
};

export const getFullNodeAutocomplete = async (searchText: string): Promise<ResponseAutocompleteFullNodes> => {
  const response = await axios.get("/api/fullNodeAutocomplete", { params: { q: searchText } });
  return response.data;
};

export const addProposal = async ({
  data,
  nodeType
}: {
  data: ProposalInput;
  nodeType: NodeType;
}): Promise<ResponseGeneric> => {
  const res = await axios.post("/api/addProposal", { data, nodeType });
  return res.data;
};
