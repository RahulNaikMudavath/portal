import { useState, useEffect } from "react";
import { getCustomerDisplayName, getPresenceStatus } from "../../services/whatsappService";
import CustomerSimulatorModal from "./CustomerSimulatorModal";
import { Search, Bot, Phone, Video, MoreVertical, X } from "lucide-react";

const ChatHeader = ({ chat, searchQuery = "", onSearchChange }) => {
  const [showSimulator, setShowSimulator] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Live presence state (auto-refreshed periodically)
  const [presence, setPresence] = useState(() => getPresenceStatus(chat));

  useEffect(() => {
    setPresence(getPresenceStatus(chat));
    const interval = setInterval(() => {
      setPresence(getPresenceStatus(chat));
    }, 15000);
    return () => clearInterval(interval);
  }, [chat?._id, chat?.conversationId, chat?.lastMessageAt, chat?.updatedAt, chat?.messages?.length]);

  if (!chat) return null;

  const displayName = getCustomerDisplayName(chat);
  const phone = chat.phoneNumber ? `+${chat.phoneNumber}` : "Direct WhatsApp";

  return (
    <>
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#202c33] shadow-xs select-none">
        {/* Customer Profile & Info */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                displayName
              )}&background=00a884&color=fff&bold=true`}
              alt={displayName}
              className="w-10 h-10 rounded-full shadow-sm object-cover"
            />
            {presence.isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#00a884] ring-2 ring-white dark:ring-[#202c33]" />
            )}
          </div>

          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate max-w-[180px] sm:max-w-xs">
              {displayName}
            </h2>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono text-[11px] text-slate-400 dark:text-slate-400">
                {phone}
              </span>
              <span className="text-slate-300 dark:text-slate-700 text-[10px]">•</span>
              {presence.isOnline ? (
                <span className="text-[11px] text-[#00a884] dark:text-[#00a884] font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-pulse" />
                  online
                </span>
              ) : (
                <span className="text-[11px] text-slate-500 dark:text-[#8696a0] font-normal">
                  {presence.text}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* In-Chat Search Bar Toggle */}
          {showSearchInput ? (
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-2.5 py-1 animate-in fade-in duration-150">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                className="w-32 sm:w-44 bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                autoFocus
              />
              <button
                onClick={() => {
                  setShowSearchInput(false);
                  if (onSearchChange) onSearchChange("");
                }}
                className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearchInput(true)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-xl text-slate-600 dark:text-slate-300 transition cursor-pointer"
              title="Search in conversation"
            >
              <Search className="h-4 w-4" />
            </button>
          )}

          {/* Sandbox Customer Simulator Button */}
          <button
            onClick={() => setShowSimulator(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold transition cursor-pointer shadow-2xs"
            title="Simulate incoming customer message, voice note, or site photo"
          >
            <Bot className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Simulate Customer</span>
          </button>

          {/* Phone / Call */}
          <a
            href={`tel:${chat.phoneNumber || ""}`}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-xl text-slate-600 dark:text-slate-300 transition"
            title="Voice Call"
          >
            <Phone className="h-4 w-4" />
          </a>

          {/* Options Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-xl text-slate-600 dark:text-slate-300 transition cursor-pointer"
              title="More options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {showMenu && (
              <div
                onClick={() => setShowMenu(false)}
                className="absolute right-0 top-10 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-1 z-30 text-xs text-slate-700 dark:text-slate-200 animate-in fade-in duration-100"
              >
                <button
                  onClick={() => setShowSimulator(true)}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                >
                  <Bot className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Simulate Message</span>
                </button>
                <button
                  onClick={() => {
                    const text = (chat.messages || []).map(m => `[${m.time || ""}] ${m.sender || "User"}: ${m.text || ""}`).join("\n");
                    navigator.clipboard.writeText(text);
                    alert("Chat transcript copied to clipboard!");
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                >
                  📋 Export Transcript
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simulator Modal */}
      <CustomerSimulatorModal
        chat={chat}
        isOpen={showSimulator}
        onClose={() => setShowSimulator(false)}
      />
    </>
  );
};

export default ChatHeader;