import API from "./api";

// get documents
export const getDocuments = (params = {}) =>
  API.get("/api/documents", { params });

// upload new document
export const uploadDocument = (formData) =>
  API.post("/api/documents", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

// toggle pin
export const togglePinDocument = (id) =>
  API.put(`/api/documents/${id}/pin`);

// upload new version
export const uploadNewVersion = (id, formData) =>
  API.put(`/api/documents/${id}/version`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

// delete document
export const deleteDocument = (id) =>
  API.delete(`/api/documents/${id}`);
