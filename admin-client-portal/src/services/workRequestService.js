import API from "./api";

export const getWorkRequests = async () => {
  const response = await API.get("/api/workrequests");
  return response.data;
};

export const getWorkRequest = async (id) => {
  const response = await API.get(`/api/workrequests/${id}`);
  return response.data;
};

export const convertWorkRequest = async (id, data) => {
  const response = await API.post(
    `/api/workrequests/${id}/convert`,
    data
  );

  return response.data;
};