import API from "./api";

export const getClients = async (search = "") => {
  const response = await API.get("/api/users", {
    params: {
      search,
    },
  });

  return response;
};

export const getEngineers = async () => {
  const response = await API.get("/api/users/engineers");
  return response.data;
};