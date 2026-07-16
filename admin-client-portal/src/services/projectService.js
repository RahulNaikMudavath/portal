import API from "./api";

// get projects
export const getProjects = () => API.get("/api/projects");

// get project details
export const getProjectById = (id) => API.get(`/api/projects/${id}`);

// create project (admin)
export const createProject = (data) => API.post("/api/projects", data);

// update project (admin)
export const updateProject = (id, data) => API.put(`/api/projects/${id}`, data);

// link task to project
export const addTaskToProject = (id, taskId) =>
  API.put(`/api/projects/${id}/tasks`, { taskId });

// upload project document
export const uploadProjectDocument = (id, formData) =>
  API.put(`/api/projects/${id}/documents`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

// upload project photo
export const uploadProjectPhoto = (id, formData, stage = "before") => {
  formData.append("stage", stage);
  return API.put(`/api/projects/${id}/photos`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

// delete project (admin)
export const deleteProject = (id) => API.delete(`/api/projects/${id}`);
