import axios, { AxiosRequestHeaders } from "axios";
import { getAuth } from "firebase/auth";

function getErrorMessage(error: any) {
  const response = error.response;
  if (!response) return error;
  if (response.status === 418) return error;
  let errorMessage = "";
  const { data } = response;
  if (data) {
    errorMessage += data.message ? data.message : "";
    errorMessage += data.errorMessage ? data.errorMessage : "";
    if (data.error) {
      console.error(data.error);
    }
  }
  return errorMessage;
}
const adapter = axios.create({
  headers: {
    Accept: "application/json"
  }
});

// Add a request interceptor
adapter.interceptors.request.use(
  async request => {
    const auth = getAuth();
    try {
      const token = await auth.currentUser?.getIdToken(true);
      if (token && token.length > 0) {
        (request.headers as AxiosRequestHeaders).Authorization = token;
      }
    } catch (error) {
      console.log("axios - cannot get tokenid");
    }

    return request;
  },
  error => {
    Promise.reject(error);
  }
);

adapter.interceptors.response.use(
  response => {
    if (response.status > 399) {
      return Promise.reject(response);
    }
    return response;
  },
  error => {
    const errorMessage = getErrorMessage(error);
    return Promise.reject(errorMessage);
  }
);

export default adapter;
