import MessageBubble from "./MessageBubble";

const Conversation = ({ chat }) => {
  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500">
        Select a conversation
      </div>
    );
  }

  const messages = chat.messages || [];

  return (
    <div className="flex flex-col gap-3 p-6 overflow-y-auto h-full">
      {messages.map((msg) => (
        <MessageBubble
          key={msg._id}
          message={{
            sender:
              msg.direction === "incoming"
                ? "Customer"
                : "Admin",

            text: msg.text,

            type: msg.direction,

            time: new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          }}
        />
      ))}

      {messages.length === 0 && (
        <div className="text-center text-slate-400 dark:text-slate-500 font-medium my-auto py-12">
          💬 No messages in this conversation yet.
        </div>
      )}
    </div>
  );
};

export default Conversation;