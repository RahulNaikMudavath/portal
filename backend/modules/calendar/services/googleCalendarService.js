/**
 * Google Calendar Integration Service (Architecture Placeholder)
 * Prepare for Google Calendar API interactions without integrating active keys yet.
 */
class GoogleCalendarService {
  /**
   * Stub method to sync an event to Google Calendar
   * @param {Object} event Mongoose event document
   * @returns {Promise<Object>} Updated event data containing dummy gcal fields
   */
  async syncEventToGoogle(event) {
    try {
      console.log(`[GoogleCalendarSync] Mock syncing event to Google Calendar: "${event.title}"`);
      
      // If it doesn't have an ID, generate a mock one
      const mockEventId = event.gcalEventId || `gcal_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        gcalEventId: mockEventId,
        gcalSyncStatus: "synced",
        gcalLastSyncedAt: new Date()
      };
    } catch (error) {
      console.error("[GoogleCalendarSync] Failed to sync to Google Calendar:", error);
      return {
        gcalSyncStatus: "error"
      };
    }
  }

  /**
   * Stub method to delete an event from Google Calendar
   * @param {String} gcalEventId 
   * @returns {Promise<Boolean>} Success status
   */
  async deleteEventFromGoogle(gcalEventId) {
    if (!gcalEventId) return true;
    console.log(`[GoogleCalendarSync] Mock deleting event from Google Calendar: ${gcalEventId}`);
    return true;
  }

  /**
   * Stub to authenticate and store access tokens for a user
   * @param {String} authCode OAuth code from Google
   */
  async handleOAuthCallback(authCode) {
    console.log(`[GoogleCalendarSync] Processing OAuth callback code: ${authCode}`);
    return {
      accessToken: "mock_google_access_token",
      refreshToken: "mock_google_refresh_token",
      expiryDate: new Date(Date.now() + 3600 * 1000) // 1 hour expiry
    };
  }

  /**
   * Generate OAuth URL for consent screen
   */
  getAuthUrl() {
    console.log("[GoogleCalendarSync] Generating Google OAuth authentication URL");
    return "https://accounts.google.com/o/oauth2/v2/auth?client_id=MOCK_CLIENT_ID&redirect_uri=MOCK_REDIRECT&response_type=code&scope=https://www.googleapis.com/auth/calendar";
  }
}

module.exports = new GoogleCalendarService();
