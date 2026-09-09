import { useState, useEffect, useRef } from "react";

import AdminLayout from "../../layouts/AdminLayout";
import ChatSidebar from "../../components/whatsapp/ChatSidebar";
import ChatWindow from "../../components/whatsapp/ChatWindow";
import AISummaryPanel from "../../components/whatsapp/AISummaryPanel";

import { getConversations, sendMessage as sendWhatsAppApi, sendMediaMessage as sendWhatsAppMediaApi, markConversationAsRead } from "../../services/whatsappService";
import socket from "../../socket";
import { playMessageSound } from "../../utils/soundEffects";

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
            const currentSelected = selectedChatRef.current;

            // If a chat is currently open and active, ensure its unread count is zeroed in local state
            const normalizedData = data.map(c => {
                if (currentSelected && (c._id === currentSelected._id || (c.conversationId && c.conversationId === currentSelected.conversationId))) {
                    return { ...c, unreadCount: 0, unread: 0 };
                }
                return c;
            });

            setChats(normalizedData);

            if (currentSelected) {
                const refreshed = normalizedData.find(c => c._id === currentSelected._id || (c.conversationId && c.conversationId === currentSelected.conversationId));
                if (refreshed) setSelectedChat(refreshed);
            }
        } catch (err) {
            console.error("Failed to load WhatsApp conversations:", err);
        }
    };

    const handleSelectChat = async (chat) => {
        if (!chat) return;

        // 1. Immediately zero out unread badge in UI state
        setSelectedChat(chat);
        setChats(prevChats =>
            prevChats.map(c => {
                const isMatch =
                    (c._id && (c._id === chat._id || c._id === chat.conversationId)) ||
                    (c.conversationId && (c.conversationId === chat.conversationId || c.conversationId === chat._id));
                if (isMatch) {
                    return { ...c, unreadCount: 0, unread: 0 };
                }
                return c;
            })
        );

        // 2. Persist read status to MongoDB backend
        const unread = chat.unreadCount || chat.unread || 0;
        const targetId = chat._id || chat.conversationId;
        if (unread > 0 && targetId) {
            try {
                await markConversationAsRead(targetId);
            } catch (err) {
                console.warn("Failed to mark conversation as read on server:", err);
            }
        }
    };

    // Automatically mark selected chat as read if it arrives with unread messages
    useEffect(() => {
        if (selectedChat) {
            const unread = selectedChat.unreadCount || selectedChat.unread || 0;
            const targetId = selectedChat._id || selectedChat.conversationId;
            if (unread > 0 && targetId) {
                markConversationAsRead(targetId).catch(() => {});
            }
        }
    }, [selectedChat?._id, selectedChat?.conversationId]);

    useEffect(() => {
        loadChats();

        // ⚡ Socket.IO Real-time listeners (Webhook -> MongoDB -> Socket.IO -> Admin Inbox)
        const handleNewMessage = (msg) => {
            console.log("⚡ [Socket.IO] New WhatsApp message received:", msg);
            playMessageSound();
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
                            onSelect={handleSelectChat}
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
