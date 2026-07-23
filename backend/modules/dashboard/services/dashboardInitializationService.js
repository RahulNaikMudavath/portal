const DashboardSettings = require("../../../modules/dashboard/models/DashboardSettings");

/**
 * Service to initialize dashboard widgets, layout preferences, and default notification settings
 * for newly registered users on their first registration cycle.
 */
const initializeUserDashboard = async (userId) => {
  try {
    const exists = await DashboardSettings.findOne({ userId });
    if (exists) {
      return exists;
    }

    // Create default isolated dashboard setup
    const settings = await DashboardSettings.create({
      userId,
      widgets: ["overview_stats", "active_workload", "ai_predictions", "recent_activity"],
      preferences: {
        layout: "grid",
        dense: "false"
      },
      settings: {
        emailAlerts: "true",
        darkModeDefault: "true"
      },
      notificationPreferences: {
        email: true,
        push: true,
        sms: false
      }
    });

    return settings;
  } catch (error) {
    console.error(`Error initializing user dashboard for user ID: ${userId}:`, error);
    throw error;
  }
};

module.exports = {
  initializeUserDashboard
};
