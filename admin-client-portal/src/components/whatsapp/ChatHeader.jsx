const ChatHeader = ({ chat }) => {
  if (!chat) return null;

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-[#111827]">

      <div className="flex items-center gap-4">

        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
            chat.customerName
          )}&background=2563eb&color=fff`}
          alt={chat.customerName}
          className="w-12 h-12 rounded-full"
        />

        <div>

          <h2 className="text-xl font-semibold text-white">
            {chat.customerName}
          </h2>

          <p className="text-sm text-green-400">
            ● Online
          </p>

        </div>

      </div>

      <div className="flex items-center gap-6 text-slate-300 text-xl">

        <button className="hover:text-green-400 transition">
          📞
        </button>

        <button className="hover:text-blue-400 transition">
          📎
        </button>

        <button className="hover:text-yellow-400 transition">
          🔍
        </button>

        <button className="hover:text-red-400 transition">
          ⋮
        </button>

      </div>

    </div>
  );
};

export default ChatHeader;