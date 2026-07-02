import ChatCard from "./ChatCard";

const ChatSidebar = ({ chats, selected, onSelect }) => {
  return (
    <div className="h-full bg-[#111827] border-r border-slate-700 flex flex-col">

      {/* Header */}
      <div className="p-5 border-b border-slate-700">

        <h2 className="text-2xl font-bold text-white">
          WhatsApp
        </h2>

        <p className="text-sm text-slate-400 mt-1">
          Customer Conversations
        </p>

      </div>

      {/* Search */}
      <div className="p-4 border-b border-slate-700">

        <input
          type="text"
          placeholder="Search customer..."
          className="w-full rounded-lg bg-slate-800 px-4 py-2 text-white placeholder:text-slate-500 outline-none border border-slate-700 focus:border-green-500"
        />

      </div>

      {/* Chats */}
      <div className="flex-1 overflow-y-auto">

        {chats.map((chat) => (

          <ChatCard
            key={chat._id}
            chat={chat}
            selected={selected}
            onSelect={onSelect}
          />

        ))}

      </div>

    </div>
  );
};

export default ChatSidebar;