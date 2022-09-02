import API from "@/lib/utils/axiosConfig";

import {
  FeedbackInput,
  FilterValue,
  KnowledgeNode,
  NodeType,
  ProposalInput,
  ResponseAPI,
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
  SignUpValidation,
  StatsSchema,
  User,
} from "../knowledgeTypes";

export const getTagsAutocomplete = async (tagName: string): Promise<ResponseAutocompleteTags> => {
  const response = await API.get("/api/tagsAutocomplete", { params: { q: tagName } });
  return response.data;
};

export const getInstitutionsAutocomplete = async (institutionName: string): Promise<ResponseAutocompleteFilter> => {
  const response = await API.get("/api/institutionsAutocomplete", { params: { q: institutionName } });
  return response.data;
};

export const getContributorsAutocomplete = async (contributorName: string): Promise<ResponseAutocompleteFilter> => {
  const response = await API.get("/api/contributorsAutocomplete", { params: { q: contributorName } });
  return response.data;
};

export const getReferencesAutocomplete = async (
  referenceSearch: string
): Promise<ResponseAutocompleteProcessedReferencesFilter> => {
  const response = await API.get("/api/referencesAutocomplete", { params: { q: referenceSearch } });
  return response.data;
};

export const sendFeedback = async (data: FeedbackInput): Promise<any> => {
  await API.post("/api/feedback", { data });
};

export const getStats = async () => {
  const response = await API.get<StatsSchema>("/api/stats");
  return response.data;
};

export const getSearchNodes = async (options: SearchNodesParams) => {
  const { q, upvotes, mostRecent, timeWindow, tags, contributors, reference, label, nodeTypes, page, institutions } =
    options;
  const response = await API.get<SearchNodesResponse>("/api/searchNodes", {
    params: { q, upvotes, mostRecent, timeWindow, tags, contributors, reference, label, nodeTypes, page, institutions },
  });
  return response.data;
};

export const getSelectedContributors = async (users: string) => {
  const response = await API.get<FilterValue[]>("/api/getSelectedContributors", {
    params: { users },
  });
  return response.data;
};

export const getSelectedInstitutions = async (institutions: string) => {
  const response = await API.get<FilterValue[]>("/api/getSelectedInstitutions", {
    params: { institutions },
  });
  return response.data;
};

export const getSearchAutocomplete = async (searchText: string): Promise<ResponseAutocompleteSearch> => {
  const response = await API.get("/api/searchAutocomplete", { params: { q: searchText } });
  return response.data;
};

export const getNodeData = async (nodeId: string): Promise<KnowledgeNode> => {
  const res = await API.post("/api/nodeData", { nodeId });
  if (!res?.data) {
    throw Error("invalid node");
  }

  return res.data.results;
};

export const getFullTagAutocomplete = async (searchText: string): Promise<ResponseAutocompleteFullTag> => {
  const response = await API.get("/api/fullTagsAutocomplete", { params: { q: searchText } });
  return response.data;
};

export const getFullReferencesAutocomplete = async (
  searchText: string
): Promise<ResponseAutocompleteFullReferences> => {
  const response = await API.get("/api/fullReferencesAutocomplete", { params: { q: searchText } });
  return response.data;
};

export const getFullNodeAutocomplete = async (searchText: string): Promise<ResponseAutocompleteFullNodes> => {
  const response = await API.get("/api/fullNodeAutocomplete", { params: { q: searchText } });
  return response.data;
};

export const addProposal = async ({
  data,
  nodeType,
}: {
  data: ProposalInput;
  nodeType: NodeType;
}): Promise<ResponseGeneric> => {
  const res = await API.post("/api/addProposal", { data, nodeType });
  return res.data;
};

export const validateSignUp = async ({
  email,
  uname,
}: {
  email: string;
  uname: string;
}): Promise<ResponseAPI<SignUpValidation>> => {
  const res = await API.get("/api/signupValidation", { params: { email, uname } });
  return { results: res.data };
};

export const signUp = async (user: User): Promise<User> => {
  const res = await API.post<User>("/api/signup", { data: user });
  return res.data;
};

export const signIn = async (): Promise<void> => {
  const res = await API.post("/api/signin");
  return res.data;
};
