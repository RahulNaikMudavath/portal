import { useState, useEffect, useRef } from "react";

import AdminLayout from "../../layouts/AdminLayout";
import ChatSidebar from "../../components/whatsapp/ChatSidebar";
import ChatWindow from "../../components/whatsapp/ChatWindow";
import AISummaryPanel from "../../components/whatsapp/AISummaryPanel";

import { getConversations, sendMessage as sendWhatsAppApi, sendMediaMessage as sendWhatsAppMediaApi } from "../../services/whatsappService";
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
            throw err;
        }
    };

    const handleSendMedia = async (chat, file, caption) => {
        try {
            const recipient = chat.phoneNumber || chat.conversationId;
            const formData = new FormData();
            formData.append("to", recipient);
            formData.append("file", file);
            if (caption) formData.append("caption", caption);

            await sendWhatsAppMediaApi(formData);
            await loadChats();
        } catch (err) {
            console.error("Failed to send WhatsApp media message:", err);
            throw err;
        }
    };

    return (
        <AdminLayout noScroll={true}>
            <div className="flex flex-col h-full overflow-hidden">
                <div className="mb-2.5 flex-shrink-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                        📥 Work Inbox & WhatsApp Control Center
                    </h1>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-0.5">
                        Real-time customer conversations & AI-powered work request extraction.
                    </p>
                </div>

                <div className="grid grid-cols-12 flex-1 min-h-0 gap-3.5 h-full overflow-hidden">
                    {/* Left Conversations Sidebar */}
                    <div className="col-span-4 xl:col-span-3 h-full overflow-hidden flex flex-col min-w-0">
                        <ChatSidebar
                            chats={chats}
                            selected={selectedChat}
                            onSelect={setSelectedChat}
                        />
                    </div>

                    {/* Middle Chat Window (Stationary Header/Footer, scrollable messages) */}
                    <div className="col-span-8 xl:col-span-6 h-full overflow-hidden flex flex-col min-w-0">
                        <ChatWindow
                            chat={selectedChat}
                            onSendMessage={handleSendMessage}
                            onSendMedia={handleSendMedia}
                        />
                    </div>

                    {/* Right AI Assistant Panel */}
                    <div className="hidden xl:flex xl:col-span-3 h-full overflow-hidden flex-col min-w-0">
                        <AISummaryPanel
                            chat={selectedChat}
                        />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

export default WhatsAppInbox;
