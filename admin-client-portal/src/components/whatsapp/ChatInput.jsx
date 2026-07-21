import { useState } from "react";

const ChatInput = () => {
  const [message, setMessage] = useState("");

  const sendMessage = () => {
    if (!message.trim()) return;

    console.log("Sending:", message);

    setMessage("");
  };

  return (
    <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">

      <div className="flex gap-3">

        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 rounded-full bg-slate-100 dark:bg-slate-800 px-5 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none border border-slate-200 dark:border-slate-700 focus:border-indigo-500 transition"
        />

        <button
          onClick={sendMessage}
          className="rounded-full bg-indigo-600 hover:bg-indigo-700 px-6 py-3 text-white font-bold text-sm shadow-md transition cursor-pointer"
        >
          Send
        </button>

      </div>

    </div>
  );
};

export default ChatInput;