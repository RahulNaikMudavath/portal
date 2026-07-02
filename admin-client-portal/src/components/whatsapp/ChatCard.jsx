const ChatCard = ({ chat, selected, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(chat)}
      className={`cursor-pointer p-4 border-b border-slate-700 transition ${
        selected?._id === chat._id
          ? "bg-slate-800"
          : "hover:bg-slate-800/60"
      }`}
    >
      <div className="flex items-center gap-3">
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
            chat.customerName || "Customer"
          )}&background=2563eb&color=fff`}
          alt={chat.customerName}
          className="w-12 h-12 rounded-full"
        />

        <div className="flex-1">
          <div className="flex justify-between">
            <h3 className="text-white font-semibold">
              {chat.customerName}
            </h3>

            <span className="text-xs text-slate-400">
              {chat.lastTime
                ? new Date(chat.lastTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </span>
          </div>

          <p className="text-sm text-slate-400 truncate">
            {chat.lastMessage || "No messages"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatCard;