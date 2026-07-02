import API from "./api";

export const createWorkOrder = async (data) => {
  const response = await API.post("/api/workorders", data);
  return response.data;
};