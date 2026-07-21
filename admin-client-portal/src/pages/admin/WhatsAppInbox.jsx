import { useState, useEffect, useRef } from "react";

import AdminLayout from "../../layouts/AdminLayout";
import ChatSidebar from "../../components/whatsapp/ChatSidebar";
import ChatWindow from "../../components/whatsapp/ChatWindow";
import AISummaryPanel from "../../components/whatsapp/AISummaryPanel";

import { getConversations } from "../../services/whatsappService";
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
                        chat.conversationId ===
                        currentSelected.conversationId
                );
                if (updatedChat)
                    setSelectedChat(updatedChat);
            }
        }
        catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadChats();

        // Listen for new messages
        socket.on("newMessage", (message) => {
            console.log("🔥 SOCKET EVENT RECEIVED");
            console.log(message);
            loadChats();
        });

        // Listen for assigned work requests
        socket.on("workRequestAssigned", (data) => {
            console.log("🔥 WORK REQUEST ASSIGNED EVENT RECEIVED", data);
            loadChats();
        });

        return () => {
            socket.off("newMessage");
            socket.off("workRequestAssigned");
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    console.log("Selected Chat:", selectedChat);

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
