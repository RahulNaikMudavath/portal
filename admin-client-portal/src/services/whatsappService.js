import API from "./api";

export const getConversations = async () => {
    const res = await API.get("/api/whatsapp/conversations");
    return res.data;
};

export const sendMessage = async (data) => {
    const res = await API.post("/api/whatsapp/send", data);
    return res.data;
};