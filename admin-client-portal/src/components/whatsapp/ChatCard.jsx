import { getCustomerDisplayName, getPresenceStatus } from "../../services/whatsappService";
import { Check, CheckCheck, Camera, Mic, FileText, Video } from "lucide-react";

const ChatCard = ({ chat, selected, onSelect }) => {
  const presence = getPresenceStatus(chat);
  const normalizeDigits = (val) => String(val || "").replace(/\D/g, "");
  const selectedPhone = normalizeDigits(selected?.phoneNumber || selected?.conversationId || selected?._id);
  const chatPhone = normalizeDigits(chat?.phoneNumber || chat?.conversationId || chat?._id);

  const isSelected = Boolean(
    selected &&
      ((selected._id && chat._id && String(selected._id) === String(chat._id)) ||
        (selected.conversationId && chat.conversationId && String(selected.conversationId) === String(chat.conversationId)) ||
        (selectedPhone && chatPhone && selectedPhone === chatPhone) ||
        (selected.customerName && chat.customerName && selected.customerName === chat.customerName && selected.customerName !== "Customer"))
  );
  const unread = isSelected ? 0 : (chat.unreadCount || chat.unread || 0);
  const displayName = getCustomerDisplayName(chat);

  const rawTime = chat.lastMessageAt || chat.lastTime || chat.updatedAt;
  const formatCardTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  const timeFormatted = formatCardTime(rawTime);

  const lastMsgObj = (chat.messages || [])[chat.messages?.length - 1];
  const isLastMsgFromAdmin = lastMsgObj && lastMsgObj.direction === "outgoing";

  const renderLastMessagePreview = () => {
    const text = chat.lastMessage || "";
    if (!text) return "No messages";

    if (text.startsWith("[Image]") || text.toLowerCase().includes("photo")) {
      return (
        <span className="flex items-center gap-1">
          <Camera className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <span>Photo</span>
        </span>
      );
    }
    if (text.startsWith("[Video]")) {
      return (
        <span className="flex items-center gap-1">
          <Video className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
          <span>Video</span>
        </span>
      );
    }
    if (text.startsWith("[Audio]") || text.toLowerCase().includes("voice note")) {
      return (
        <span className="flex items-center gap-1">
          <Mic className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <span>Voice note</span>
        </span>
      );
    }
    if (text.startsWith("[Document") || text.startsWith("[PDF") || text.toLowerCase().includes("boq") || text.toLowerCase().includes("quote")) {
      return (
        <span className="flex items-center gap-1">
          <FileText className="h-3.5 w-3.5 text-rose-500 shrink-0" />
          <span>Document</span>
        </span>
      );
    }

    return text;
  };

  return (
    <div
      onClick={() => onSelect(chat)}
      className={`cursor-pointer px-4 py-3 transition-all duration-150 border-b border-slate-100 dark:border-[#222d34] ${
        isSelected
          ? "bg-slate-100 dark:bg-[#2a3942]"
          : "hover:bg-slate-50 dark:hover:bg-[#202c33]/70 bg-white dark:bg-[#111b21]"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Customer Avatar */}
        <div className="relative shrink-0">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              displayName
            )}&background=00a884&color=fff&bold=true`}
            alt={displayName}
            className="w-12 h-12 rounded-full shadow-xs object-cover"
          />
          {presence.isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#00a884] ring-2 ring-white dark:ring-[#111b21]" />
          )}
        </div>

        {/* Info Column */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-[#e9edef] truncate">
              {displayName}
            </h3>

            <span className={`text-[11px] font-medium shrink-0 ${
              unread > 0 ? "text-[#00a884] font-bold" : "text-slate-400 dark:text-[#8696a0]"
            }`}>
              {timeFormatted}
            </span>
          </div>

          <div className="flex items-center justify-between gap-1 mt-1">
            <p className="text-xs text-slate-500 dark:text-[#8696a0] truncate flex items-center gap-1">
              {isLastMsgFromAdmin && (
                <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb] shrink-0" />
              )}
              <span className="truncate">{renderLastMessagePreview()}</span>
            </p>

            {unread > 0 && (
              <span className="bg-[#00a884] text-white text-[11px] font-black min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center shrink-0 shadow-xs">
                {unread}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatCard;