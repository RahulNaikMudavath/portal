import { useState } from "react";
import ChatCard from "./ChatCard";
import { getCustomerDisplayName } from "../../services/whatsappService";
import { MessageSquarePlus, Search, Filter, Sparkles } from "lucide-react";

const ChatSidebar = ({ chats = [], selected, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = ["All", "Unread", "Inquiries", "Quotes"];

  const filteredChats = chats.filter((chat) => {
    // 1. Text search filter
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      const displayName = getCustomerDisplayName(chat).toLowerCase();
      const phone = (chat.phoneNumber || "").toLowerCase();
      const lastMsg = (chat.lastMessage || "").toLowerCase();
      if (!displayName.includes(query) && !phone.includes(query) && !lastMsg.includes(query)) {
        return false;
      }
    }

    // 2. Category filter
    const unread = chat.unreadCount || chat.unread || 0;
    if (activeFilter === "Unread") return unread > 0;
    if (activeFilter === "Quotes") {
      return (chat.lastMessage || "").toLowerCase().includes("quote") ||
        (chat.lastMessage || "").toLowerCase().includes("boq") ||
        (chat.lastMessage || "").toLowerCase().includes("estimate");
    }
    if (activeFilter === "Inquiries") {
      return (chat.lastMessage || "").toLowerCase().includes("inquiry") ||
        (chat.lastMessage || "").toLowerCase().includes("site") ||
        (chat.lastMessage || "").toLowerCase().includes("inspection");
    }

    return true;
  });

  return (
    <div className="h-full bg-white dark:bg-[#111b21] border-r border-slate-200 dark:border-slate-800 flex flex-col rounded-2xl shadow-sm overflow-hidden select-none">
      {/* WhatsApp Web Top Header Bar */}
      <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#202c33] shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              💬
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-wide flex items-center gap-1.5">
                <span>WhatsApp Chats</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </h2>
              <p className="text-[10px] font-semibold text-slate-500 dark:text-[#8696a0]">
                Meta Cloud API Dispatch
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {chats.length} active
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mt-3">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400 dark:text-[#8696a0]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search or start new chat..."
            className="w-full rounded-xl bg-slate-100 dark:bg-[#2a3942] pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-[#d1d7db] placeholder:text-slate-400 dark:placeholder:text-[#8696a0] outline-none border border-transparent focus:border-emerald-500 transition"
          />
        </div>

        {/* Category Filters Pills */}
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-0.5 text-xs">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer shrink-0 ${
                activeFilter === f
                  ? "bg-[#00a884] text-white shadow-xs"
                  : "bg-slate-100 dark:bg-[#202c33] text-slate-600 dark:text-[#8696a0] hover:bg-slate-200 dark:hover:bg-[#2a3942]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-slate-100 dark:divide-slate-800/60">
        {filteredChats.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-[#8696a0] text-xs">
            {searchQuery ? "No matching conversations" : "No active chats"}
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