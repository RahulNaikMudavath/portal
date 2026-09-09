import { useState } from "react";
import ChatHeader from "./ChatHeader";
import Conversation from "./Conversation";
import ChatInput from "./ChatInput";

const ChatWindow = ({ chat, onSendMessage, onSendMedia }) => {
  const [replyingTo, setReplyingTo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500 font-medium bg-white dark:bg-[#111b21] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        Select a conversation from the sidebar
      </div>
    );
  }

  // Filter messages if search is active
  const filteredChat = searchQuery.trim()
    ? {
        ...chat,
        messages: (chat.messages || []).filter((m) =>
          (m.text || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (m.customerName || "").toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }
    : chat;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111b21] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden select-none">
      {/* Header with Search & Sandbox Simulator */}
      <div className="shrink-0 z-10">
        <ChatHeader
          chat={chat}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Main Conversation Body with WhatsApp Wallpaper */}
      <div className="flex-1 overflow-y-auto min-h-0 relative">
        <Conversation
          chat={filteredChat}
          onReply={(msg) => setReplyingTo(msg)}
        />
      </div>

      {/* Bottom Input Area */}
      <div className="shrink-0 z-10">
        <ChatInput
          chat={chat}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          onSendMessage={onSendMessage}
          onSendMedia={onSendMedia}
        />
      </div>
    </div>
  );
};

export default ChatWindow;