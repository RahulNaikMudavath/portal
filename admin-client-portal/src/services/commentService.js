import API from "./api";

// Get all comments for one task
export const getTaskComments = (taskId) => {
  return API.get(`/api/comments/task/${taskId}`);
};

// Add a comment to one task
export const addTaskComment = (taskId, message) => {
  return API.post(`/api/comments/task/${taskId}`, {
    message,
  });
};