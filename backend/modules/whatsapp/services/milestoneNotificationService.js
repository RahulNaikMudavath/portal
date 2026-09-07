const { sendTextMessage } = require("./messageService");
const { normalizePhoneNumber } = require("../utils/whatsappUtils");

/**
 * MilestoneNotificationService
 * Automatically dispatches real-time WhatsApp milestone updates to Clients & Engineers
 * when task checkpoints and admin reviews change.
 */

/**
 * Notify client on field visit milestone (Travel started, Reached site, Inspection complete)
 */
const notifyClientVisitCheckpoint = async (task, engineerName = "Field Engineer", io = null) => {
  try {
    const targetPhone = task?.phoneNumber;
    if (!targetPhone) return null;

    let messageText = "";
    const cleanName = task.customerName || "Valued Client";

    switch (task.visitStatus) {
      case "travel-started":
        messageText = `🚗 *MAARAN Engineers & Consultancy*
Hello ${cleanName},
Your assigned field engineer *${engineerName}* is en route to your site for *"${task.title}"*.
📍 *Site:* ${task.siteAddress || "Field Site Location"}
_We will notify you once the team arrives._`;
        break;

      case "reached-site":
        messageText = `📍 *MAARAN Engineers & Consultancy*
Hello ${cleanName},
Engineer *${engineerName}* has *safely reached your site* and started inspection / technical work for *"${task.title}"*.`;
        break;

      case "inspection-started":
        messageText = `🔍 *MAARAN Engineers & Consultancy*
Technical field inspection is now in progress for *"${task.title}"*. Digital measurements & photos are being captured.`;
        break;

      case "inspection-completed":
        messageText = `✅ *MAARAN Engineers & Consultancy*
Hello ${cleanName},
Field inspection & on-site work for *"${task.title}"* has been successfully completed by *${engineerName}*.
The final documentation & material logs are being processed.`;
        break;

      default:
        return null;
    }

    if (messageText) {
      const res = await sendTextMessage(targetPhone, messageText, io);
      console.log(`[WhatsApp Milestone] Sent visit status (${task.visitStatus}) notification to ${targetPhone}`);
      return res;
    }
  } catch (error) {
    console.warn(`[WhatsApp Milestone] Could not send visit update to ${task?.phoneNumber}:`, error.message);
    return null;
  }
};

/**
 * Notify client when admin approves and evaluates task
 */
const notifyClientTaskApproved = async (task, adminRating = 5, reviewRemarks = "", io = null) => {
  try {
    const targetPhone = task?.phoneNumber;
    if (!targetPhone) return null;

    const cleanName = task.customerName || "Valued Client";
    const stars = "★".repeat(Math.min(5, Math.max(1, adminRating)));

    const messageText = `🎉 *MAARAN Engineers & Consultancy*
📋 *Quality Review & Approval Notice*

Hello ${cleanName},
We are pleased to inform you that your work order *"${task.title}"* has been officially reviewed and *APPROVED* by our engineering administration.

⭐ *Quality Rating:* ${stars} (${adminRating}/5)
${reviewRemarks ? `💬 *Remarks:* "${reviewRemarks}"\n` : ""}
Thank you for partnering with MAARAN Engineers & Consultancy. For any follow-up structural queries, feel free to reply directly to this chat!`;

    const res = await sendTextMessage(targetPhone, messageText, io);
    console.log(`[WhatsApp Milestone] Sent task approval notification to ${targetPhone}`);
    return res;
  } catch (error) {
    console.warn(`[WhatsApp Milestone] Could not send approval update to ${task?.phoneNumber}:`, error.message);
    return null;
  }
};

/**
 * Notify engineer when assigned a new task
 */
const notifyEngineerTaskAssigned = async (task, engineerPhone, engineerName, io = null) => {
  try {
    if (!engineerPhone) return null;

    const messageText = `🏗️ *MAARAN ERP Dispatch*
Hello ${engineerName || "Engineer"},
You have been assigned a new work order:
📋 *Task:* ${task.title}
👤 *Client:* ${task.customerName || "Direct"}
📍 *Site Location:* ${task.siteAddress || "Office / Remote"}
⏰ *Priority:* ${(task.priority || "Medium").toUpperCase()}

Please open your ConstructAI portal to accept and start travel.`;

    const res = await sendTextMessage(engineerPhone, messageText, io);
    console.log(`[WhatsApp Milestone] Sent task assignment alert to engineer ${engineerPhone}`);
    return res;
  } catch (error) {
    console.warn(`[WhatsApp Milestone] Could not send assignment alert to ${engineerPhone}:`, error.message);
    return null;
  }
};

module.exports = {
  notifyClientVisitCheckpoint,
  notifyClientTaskApproved,
  notifyEngineerTaskAssigned
};
