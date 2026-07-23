import api from "./api";

export const convertWorkRequest = (id, data) =>
  api.post(
    `/workrequests/${id}/convert`,
    data
  );