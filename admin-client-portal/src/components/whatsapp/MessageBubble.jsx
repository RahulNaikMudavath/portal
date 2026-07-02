const MessageBubble = ({ message }) => {
  const isCustomer = message.sender === "Customer";

  const time = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div
      className={`flex mb-4 ${
        isCustomer ? "justify-start" : "justify-end"
      }`}
    >
      <div
        className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-md ${
          isCustomer
            ? "bg-slate-700 text-white"
            : "bg-green-600 text-white"
        }`}
      >
        <p className="text-xs font-semibold mb-1 opacity-70">
          {message.sender}
        </p>

        {/* FIXED */}
        <p className="whitespace-pre-wrap">
          {message.text}
        </p>

        <p className="text-[10px] mt-2 text-right opacity-60">
          {time}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;