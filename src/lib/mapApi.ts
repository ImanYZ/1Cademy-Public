import API from "@/lib/utils/axiosConfig";

import { ResponseAutocompleteTags, ResponseUploadImage } from "../knowledgeTypes";
import { getIdToken } from "./firestoreClient/auth";

/**
 * @deprecated use Post method instead
 */
export const postWithToken = async (mapUrl: string, postData: any = {}): Promise<ResponseAutocompleteTags> => {
  const token = await getIdToken();
  const response = await API.post(`/api${mapUrl}`, { ...postData }, { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
};

export const postImageWithToken = async (mapUrl: string, postData: any = {}): Promise<ResponseUploadImage> => {
  const token = await getIdToken();
  const response = await API.post(
    `/api${mapUrl}`,
    { ...postData },
    { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
  );
  return response.data;
};
// export const updateCorrectNode = async (): Promise<ResponseAutocompleteTags> => {
//   const token = await getIdToken()
//   const response = await API.get("/api/tagsAutocomplete", { headers: { Authorization: token ? `Bearer ${token}` : '' }, params: { q: tagName } })
//   return response.data
// }
// extends unknown

/**
 * will call endpoint in this way: http://localhost:3000/api/{mapUrl}
 */
export const Post = async <R>(mapUrl: string, postData: any = {}): Promise<R> => {
  const token = await getIdToken();
  const response = await API.post(`/api${mapUrl}`, { ...postData }, { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
};

export const Delete = async <R>(mapUrl: string, postData: any = {}): Promise<R> => {
  const token = await getIdToken();
  console.log("11 call delete");
  const response = await API.delete(`/api${mapUrl}`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { ...postData },
  });
  console.log("11 get answer");
  return response.data;
};
