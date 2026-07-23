const MessageBubble = ({ message }) => {
  const isCustomer = message.direction === "incoming" || message.type === "incoming" || message.sender === "Customer";

  const time = message.time || (message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "");

  const senderName = isCustomer
    ? (message.customerName || "Customer")
    : "Admin";

  return (
    <div
      className={`flex mb-3 ${
        isCustomer ? "justify-start" : "justify-end"
      }`}
    >
      <div
        className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm text-sm border transition-colors ${
          isCustomer
            ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 rounded-bl-xs"
            : "bg-indigo-600 dark:bg-indigo-600 text-white border-indigo-700 dark:border-indigo-500 rounded-br-xs shadow-md"
        }`}
      >
        <p className="text-[11px] font-bold mb-1 opacity-75">
          {senderName}
        </p>

        <p className="whitespace-pre-wrap leading-relaxed">
          {message.text}
        </p>

        <p className="text-[10px] font-medium mt-1.5 text-right opacity-70">
          {time}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;