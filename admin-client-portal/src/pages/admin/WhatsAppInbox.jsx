import { useState, useEffect } from "react";

import AdminLayout from "../../layouts/AdminLayout";
import ChatSidebar from "../../components/whatsapp/ChatSidebar";
import ChatWindow from "../../components/whatsapp/ChatWindow";
import AISummaryPanel from "../../components/whatsapp/AISummaryPanel";

import { getConversations } from "../../services/whatsappService";
import socket from "../../socket";

function WhatsAppInbox() {

    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);

    const loadChats = async () => {

        try {

            const data = await getConversations();

            setChats(data);

            if (!selectedChat && data.length > 0) {
                setSelectedChat(data[0]);
                return;
            }

            if (selectedChat) {

                const updatedChat = data.find(
                    chat =>
                        chat.conversationId ===
                        selectedChat.conversationId
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

    }, [selectedChat]);

    console.log("Selected Chat:", selectedChat);

    return (

        <AdminLayout>

            <div className="grid grid-cols-12 h-[85vh] gap-4">

                <div className="col-span-3">

                    <ChatSidebar
                        chats={chats}
                        selected={selectedChat}
                        onSelect={setSelectedChat}
                    />

                </div>

                <div className="col-span-6">

                    <ChatWindow
                        chat={selectedChat}
                    />

                </div>

                <div className="col-span-3">

                    <AISummaryPanel
                        chat={selectedChat}
                    />

                </div>

            </div>

        </AdminLayout>

    );

}

export default WhatsAppInbox;
