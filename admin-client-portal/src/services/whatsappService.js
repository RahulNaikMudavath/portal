import API from "./api";

export const getConversations = async () => {
    const res = await API.get("/api/whatsapp/conversations");
    return res.data;
};