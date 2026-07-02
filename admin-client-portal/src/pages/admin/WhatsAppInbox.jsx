import { useState,useEffect } from "react";

import AdminLayout from "../../layouts/AdminLayout";
import ChatSidebar from "../../components/whatsapp/ChatSidebar";
import ChatWindow from "../../components/whatsapp/ChatWindow";
import AISummaryPanel from "../../components/whatsapp/AISummaryPanel";
import { getConversations } from "../../services/whatsappService";
function WhatsAppInbox() {

const [chats, setChats] = useState([]);

const [selectedChat, setSelectedChat] = useState(null);
useEffect(() => {

    loadChats();

}, []);
const loadChats = async () => {

    try {

        const data = await getConversations();

        setChats(data);

        if (data.length > 0)

            setSelectedChat(data[0]);

    }

    catch (err) {

        console.error(err);

    }

};
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