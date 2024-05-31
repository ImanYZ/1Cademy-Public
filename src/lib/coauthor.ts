import API from "@/lib/utils/axiosConfig";
export const getArticleTypes = async () => {
  const response = await API.get("/api/coauthor/articleTypes");
  return response.data;
};

export const getArticleSteps = async ({ queryKey }: any) => {
  const [{}, title] = queryKey;
  const response = await API.post("/api/coauthor/articleSteps", { nodeTitle: title });
  return response.data;
};
