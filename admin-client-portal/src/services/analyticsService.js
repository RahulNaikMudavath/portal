import API from "./api";

export const getAdminAnalytics = () => {
  return API.get("/api/analytics/admin");
};