import API from "./api";

// create task (admin)
export const createTask = (data) => {
  let payload = data;
  if (!(data instanceof FormData)) {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });
    payload = formData;
  }
  return API.post("/api/tasks", payload, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

// get tasks
export const getTasks = () => API.get("/api/tasks");

// start task
export const startTask = (id) =>
  API.put(`/api/tasks/${id}/start`);

// submit task
export const submitTask = (id, data) =>
  API.put(`/api/tasks/${id}/submit`, data, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

// review task (admin)
export const reviewTask = (id, status, adminRating = 5, reason = "") =>
  API.put(`/api/tasks/${id}/review`, { status, adminRating, reason });

export const getRecentActivities = () =>
  API.get("/api/tasks/activities/recent");

// update progress (client)
export const updateTaskProgress = (id, data) =>
  API.put(`/api/tasks/${id}/progress`, data);

// upload attachment (client)
export const uploadTaskAttachment = (id, formData) =>
  API.put(`/api/tasks/${id}/attachment`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

// update visit/travel status (client)
export const updateVisitStatus = (id, visitStatus, locationCoords) =>
  API.put(`/api/tasks/${id}/visit-status`, { visitStatus, locationCoords });

// add material (client)
export const addMaterial = (id, material) =>
  API.put(`/api/tasks/${id}/materials`, material);

// add note (client)
export const addTaskNote = (id, text) =>
  API.post(`/api/tasks/${id}/notes`, { text });

// edit note (client)
export const editTaskNote = (id, noteId, text) =>
  API.put(`/api/tasks/${id}/notes/${noteId}`, { text });

// delete note (client)
export const deleteTaskNote = (id, noteId) =>
  API.delete(`/api/tasks/${id}/notes/${noteId}`);

// delete attachment media (client/admin)
export const deleteTaskAttachment = (id, fileUrl) =>
  API.post(`/api/tasks/${id}/delete-attachment`, { fileUrl });

// submit customer sign-off (client)
export const submitCustomerSignOff = (id, signOffData) =>
  API.put(`/api/tasks/${id}/sign-off`, signOffData);