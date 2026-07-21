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

// Live iCalendar .ics Subscription Feed URL (for Phone, Apple, Google Calendar)
export const getIcsFeedUrl = () => {
  const baseURL = API.defaults.baseURL || "http://localhost:5000";
  return `${baseURL}/api/calendar/feed/admin-calendar.ics`;
};

export const getWebcalFeedUrl = () => {
  const url = getIcsFeedUrl();
  return url.replace(/^http:/, "webcal:").replace(/^https:/, "webcal:");
};

// 1-Click Google Calendar Event Link
export const getGoogleCalendarUrl = (event) => {
  const title = encodeURIComponent(event.title || "Portal Activity");
  const details = encodeURIComponent(event.description || "Logged in Admin Portal");
  const location = encodeURIComponent(event.location || "On Site");
  
  const formatDate = (d) => {
    const dt = new Date(d || new Date());
    return dt.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const start = formatDate(event.start);
  const end = formatDate(event.end || new Date(new Date(event.start || new Date()).getTime() + 3600000));

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
};

export const downloadIcsFile = (eventId) => {
  const baseURL = API.defaults.baseURL || "http://localhost:5000";
  window.open(`${baseURL}/api/calendar/${eventId}/export.ics`, "_blank");
};
