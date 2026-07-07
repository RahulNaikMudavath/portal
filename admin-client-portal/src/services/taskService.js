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
export const reviewTask = (id, status) =>
  API.put(`/api/tasks/${id}/review`, { status });

export const getRecentActivities = () =>
  API.get("/api/tasks/activities/recent");