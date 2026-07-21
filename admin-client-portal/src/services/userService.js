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

export const updateUserLocation = async (lat, lng, address = "") => {
  const response = await API.put("/api/users/location", {
    lat,
    lng,
    address,
  });
  return response.data;
};