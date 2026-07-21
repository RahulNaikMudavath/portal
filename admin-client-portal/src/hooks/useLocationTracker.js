import { useEffect } from "react";
import { updateUserLocation } from "../services/userService";

export function useLocationTracker() {
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;

    try {
      const user = JSON.parse(userStr);
      // Only track location for client/engineer role
      if (user.role !== "client") return;

      const reportLocation = () => {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              await updateUserLocation(latitude, longitude);
              console.log(`[Location Tracker] Reported position: ${latitude}, ${longitude}`);
            } catch (err) {
              console.error("[Location Tracker] Failed to send location:", err);
            }
          },
          (err) => {
            console.warn("[Location Tracker] Geolocation permission or access error:", err.message);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
        );
      };

      // Initial ping on app open
      reportLocation();

      // Interval ping every 3 minutes while active
      const interval = setInterval(reportLocation, 180000);

      return () => clearInterval(interval);
    } catch (e) {
      console.error("[Location Tracker] Parsing error:", e);
    }
  }, []);
}
