import API from "./api";

export const getConversations = async () => {
    const res = await API.get("/api/whatsapp/conversations");
    return res.data;
};

export const sendMessage = async (data) => {
    const res = await API.post("/api/whatsapp/send", data);
    return res.data;
};

export const sendMediaMessage = async (formData) => {
    const res = await API.post("/api/whatsapp/send-media", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
    return res.data;
};

export const simulateIncomingMessage = async (data) => {
    const res = await API.post("/api/whatsapp/simulate-incoming", data);
    return res.data;
};

export const markConversationAsRead = async (conversationId) => {
    if (!conversationId) return null;
    try {
        const res = await API.patch(`/api/whatsapp/conversations/${conversationId}/read`);
        return res.data;
    } catch (err) {
        const res = await API.post(`/api/whatsapp/conversations/${conversationId}/read`);
        return res.data;
    }
};


export const getCustomerDisplayName = (chat) => {
    if (!chat) return "Customer";
    if (
        chat.customerName &&
        chat.customerName !== "Customer" &&
        chat.customerName !== "Unknown Customer"
    ) {
        return chat.customerName;
    }
    if (chat.user?.name) return chat.user.name;
    const realNameMsg = chat.messages?.find(
        (m) =>
            m.direction === "incoming" &&
            m.customerName &&
            m.customerName !== "Customer" &&
            m.customerName !== "Unknown Customer"
    );
    if (realNameMsg?.customerName) return realNameMsg.customerName;
    if (chat.phoneNumber) return `+${chat.phoneNumber}`;
    return "Customer";
};

// 🟢 Authentic WhatsApp Online & Last Seen Calculator
export const getPresenceStatus = (chat) => {
    if (!chat) return { isOnline: false, text: "offline" };

    // 1. Resolve the most recent activity timestamp
    let latestTime = null;

    if (chat.lastMessageAt) {
        const d = new Date(chat.lastMessageAt);
        if (!isNaN(d.getTime())) latestTime = d;
    }

    if (!latestTime && chat.updatedAt) {
        const d = new Date(chat.updatedAt);
        if (!isNaN(d.getTime())) latestTime = d;
    }

    if (!latestTime && Array.isArray(chat.messages) && chat.messages.length > 0) {
        const lastMsg = chat.messages[chat.messages.length - 1];
        const val = lastMsg.createdAt || lastMsg.timestamp;
        if (val) {
            const d = new Date(val);
            if (!isNaN(d.getTime())) latestTime = d;
        }
    }

    // Handle fallback if lastTime is stored as a formatted string (e.g. "10:04 pm", "Yesterday", "5 Sept")
    if (!latestTime && (chat.lastTime || chat.lastMessageAt)) {
        const str = String(chat.lastTime || chat.lastMessageAt);
        if (str.toLowerCase().includes("am") || str.toLowerCase().includes("pm")) {
            return { isOnline: false, text: `last seen today at ${str.toLowerCase()}` };
        }
        return { isOnline: false, text: `last seen ${str}` };
    }

    if (!latestTime) {
        return { isOnline: false, text: "last seen recently" };
    }

    const now = new Date();
    const diffMs = now.getTime() - latestTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    // Online threshold: active within 3 minutes
    if (diffMinutes < 3) {
        return { isOnline: true, text: "online" };
    }

    const timeStr = latestTime.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    }).toLowerCase();

    // Check if Today
    const isToday = latestTime.toDateString() === now.toDateString();
    if (isToday) {
        return { isOnline: false, text: `last seen today at ${timeStr}` };
    }

    // Check if Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = latestTime.toDateString() === yesterday.toDateString();
    if (isYesterday) {
        return { isOnline: false, text: `last seen yesterday at ${timeStr}` };
    }

    // Within last 6 days: show day name (e.g. Wednesday at 3:15 pm)
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
        const dayName = latestTime.toLocaleDateString([], { weekday: "long" });
        return { isOnline: false, text: `last seen ${dayName} at ${timeStr}` };
    }

    // Older than 6 days: show date (e.g. 5 Sept at 10:04 pm)
    const dateStr = latestTime.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    return { isOnline: false, text: `last seen on ${dateStr} at ${timeStr}` };
};