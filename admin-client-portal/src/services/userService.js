import API from "./api";

export const getClients = (search = "") => {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return API.get(`/api/users/clients${query}`);
};