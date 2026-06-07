import API from "./api";

export const getNotifications = () => API.get("/api/users/notifications/list");

export const markAsRead = (notificationId) =>
  API.put(`/api/users/notifications/${notificationId}/read`);

export const markAllAsRead = () =>
  API.put("/api/users/notifications/read-all");
