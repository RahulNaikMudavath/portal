import API from "./api";

export const login = (form) => API.post("/api/auth/login", form);
export const signup = (form) => API.post("/api/auth/signup", form);
export const changePassword = (data) => API.put("/api/auth/change-password", data);
