import API from "./api";

// Fetch calendar events
export const getCalendarEvents = () => API.get("/api/calendar");

// Create calendar event
export const createCalendarEvent = (eventData) => API.post("/api/calendar", eventData);

// Update calendar event (supports drag & drop updates)
export const updateCalendarEvent = (id, eventData) => API.put(`/api/calendar/${id}`, eventData);

// Delete calendar event
export const deleteCalendarEvent = (id) => API.delete(`/api/calendar/${id}`);

// Check scheduling conflicts
export const checkCalendarConflicts = (conflictData) => API.post("/api/calendar/check-conflicts", conflictData);
