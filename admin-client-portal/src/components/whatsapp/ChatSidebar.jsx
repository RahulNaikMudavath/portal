import { useState } from "react";
import ChatCard from "./ChatCard";

const ChatSidebar = ({ chats = [], selected, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = chats.filter((chat) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const name = (chat.customerName || "").toLowerCase();
    const phone = (chat.phoneNumber || "").toLowerCase();
    return name.includes(query) || phone.includes(query);
  });

  return (
    <div className="h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col rounded-2xl shadow-sm overflow-hidden">

      {/* Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">

        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>💬</span> WhatsApp Conversations
        </h2>

        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
          Active Customer Inquiries
        </p>

      </div>

      {/* Search */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search customer..."
          className="w-full rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none border border-slate-200 dark:border-slate-700 focus:border-emerald-500 transition"
        />

      </div>

      {/* Chats */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">

        {filteredChats.length === 0 ? (
          <div className="p-6 text-center text-slate-400 dark:text-slate-500 text-sm">
            {searchQuery ? "No matching conversations" : "No active conversations"}
          </div>
        ) : (
          filteredChats.map((chat) => (
            <ChatCard
              key={chat._id || chat.conversationId}
              chat={chat}
              selected={selected}
              onSelect={onSelect}
            />
          ))
        )}

      </div>

    </div>
  );
};

export default ChatSidebar;