const ChatCard = ({ chat, selected, onSelect }) => {
  const isSelected = selected?._id === chat._id || (selected?.conversationId && selected?.conversationId === chat.conversationId);
  const unread = chat.unreadCount || chat.unread || 0;

  const rawTime = chat.lastMessageAt || chat.lastTime || chat.updatedAt;
  const timeFormatted = rawTime
    ? new Date(rawTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div
      onClick={() => onSelect(chat)}
      className={`cursor-pointer p-4 transition-all duration-200 border-b border-slate-100 dark:border-slate-800/60 ${
        isSelected
          ? "bg-indigo-50 dark:bg-slate-800/90 border-l-4 border-l-indigo-600 dark:border-l-indigo-500"
          : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
      }`}
    >
      <div className="flex items-center gap-3">
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
            chat.customerName || "Customer"
          )}&background=4f46e5&color=fff`}
          alt={chat.customerName}
          className="w-11 h-11 rounded-full shadow-sm flex-shrink-0"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {chat.customerName || "Customer"}
            </h3>

            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 flex-shrink-0">
              {timeFormatted}
            </span>
          </div>

          <div className="flex items-center justify-between gap-1 mt-0.5">
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex-1">
              {chat.lastMessage || "No messages"}
            </p>
            {unread > 0 && (
              <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 shadow-xs">
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