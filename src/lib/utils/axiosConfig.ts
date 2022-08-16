import axios from "axios";

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
    Accept: "application/json",
  }
});

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
