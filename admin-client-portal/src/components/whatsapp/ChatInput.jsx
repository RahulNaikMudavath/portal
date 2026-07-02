import { useState } from "react";

const ChatInput = () => {
  const [message, setMessage] = useState("");

  const sendMessage = () => {
    if (!message.trim()) return;

    console.log("Sending:", message);

    setMessage("");
  };

  return (
    <div className="border-t border-slate-700 bg-[#111827] p-4">

      <div className="flex gap-3">

        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-full bg-slate-800 px-5 py-3 text-white outline-none border border-slate-700 focus:border-green-500"
        />

        <button
          onClick={sendMessage}
          className="rounded-full bg-green-600 hover:bg-green-700 px-6 py-3 text-white font-semibold transition"
        >
          Send
        </button>

      </div>

    </div>
  );
};

export default ChatInput;