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