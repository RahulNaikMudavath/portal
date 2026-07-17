import API from "./api";

export const getAdminAnalytics = () => {
  return API.get("/api/analytics/admin");
};

export const getEngineerPerformanceAnalytics = () => {
  return API.get("/api/analytics/engineers");
};

export const getAiAnalytics = () => {
  return API.get("/api/analytics/ai");
};