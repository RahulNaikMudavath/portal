import { useState, useEffect, useRef } from "react";

import AdminLayout from "../../layouts/AdminLayout";
import ChatSidebar from "../../components/whatsapp/ChatSidebar";
import ChatWindow from "../../components/whatsapp/ChatWindow";
import AISummaryPanel from "../../components/whatsapp/AISummaryPanel";

import { getConversations, sendMessage as sendWhatsAppApi } from "../../services/whatsappService";
import socket from "../../socket";

function WhatsAppInbox() {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const selectedChatRef = useRef(null);

    // Keep ref in sync with active state
    useEffect(() => {
        selectedChatRef.current = selectedChat;
    }, [selectedChat]);

    const loadChats = async () => {
        try {
            const data = await getConversations();
            setChats(data);

            const currentSelected = selectedChatRef.current;
            if (!currentSelected && data.length > 0) {
                setSelectedChat(data[0]);
                return;
            }

            if (currentSelected) {
                const updatedChat = data.find(
                    chat =>
                        chat.conversationId === currentSelected.conversationId ||
                        chat._id === currentSelected._id
                );
                if (updatedChat) {
                    setSelectedChat(updatedChat);
                }
            }
        } catch (err) {
            console.error("Failed to load WhatsApp conversations:", err);
        }
    };

    useEffect(() => {
        loadChats();

        // ⚡ Socket.IO Real-time listeners (Webhook -> MongoDB -> Socket.IO -> Admin Inbox)
        const handleNewMessage = (msg) => {
            console.log("⚡ [Socket.IO] New WhatsApp message received:", msg);
            loadChats();
        };

        const handleConversationUpdated = (conv) => {
            console.log("⚡ [Socket.IO] WhatsApp conversation updated:", conv);
            loadChats();
        };

        const handleWorkRequestAssigned = (data) => {
            console.log("⚡ [Socket.IO] Work request assigned:", data);
            loadChats();
        };

        socket.on("newMessage", handleNewMessage);
        socket.on("conversationUpdated", handleConversationUpdated);
        socket.on("workRequestAssigned", handleWorkRequestAssigned);

        return () => {
            socket.off("newMessage", handleNewMessage);
            socket.off("conversationUpdated", handleConversationUpdated);
            socket.off("workRequestAssigned", handleWorkRequestAssigned);
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSendMessage = async (chat, text) => {
        try {
            const recipient = chat.phoneNumber || chat.conversationId;
            await sendWhatsAppApi({
                to: recipient,
                text: text
            });
            await loadChats();
        } catch (err) {
            console.error("Failed to send WhatsApp message:", err);
        }
    };

    return (
        <AdminLayout>
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    📥 Work Inbox & WhatsApp Control Center
                </h1>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-0.5">
                    Real-time customer conversations & AI-powered work request extraction.
                </p>
            </div>

            <div className="grid grid-cols-12 h-[calc(85vh-3.5rem)] gap-4">
                <div className="col-span-3 h-full">
                    <ChatSidebar
                        chats={chats}
                        selected={selectedChat}
                        onSelect={setSelectedChat}
                    />
                </div>

                <div className="col-span-6 h-full">
                    <ChatWindow
                        chat={selectedChat}
                        onSendMessage={handleSendMessage}
                    />
                </div>

                <div className="col-span-3 h-full">
                    <AISummaryPanel
                        chat={selectedChat}
                    />
                </div>
            </div>
        </AdminLayout>
    );
}

export default WhatsAppInbox;
