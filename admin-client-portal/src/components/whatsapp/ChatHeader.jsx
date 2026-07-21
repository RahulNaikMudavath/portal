const ChatHeader = ({ chat }) => {
  if (!chat) return null;

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">

      <div className="flex items-center gap-3.5">

        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
            chat.customerName || "Customer"
          )}&background=4f46e5&color=fff`}
          alt={chat.customerName}
          className="w-11 h-11 rounded-full shadow-sm"
        />

        <div>

          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {chat.customerName || "Customer"}
          </h2>

          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Online
          </p>

        </div>

      </div>

      <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300 text-lg">

        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer" title="Call">
          📞
        </button>

        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer" title="Attach">
          📎
        </button>

        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer" title="Search">
          🔍
        </button>

        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer" title="Options">
          ⋮
        </button>

      </div>

    </div>
  );
};

export default ChatHeader;