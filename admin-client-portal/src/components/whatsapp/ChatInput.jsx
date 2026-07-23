import { useState } from "react";

const ChatInput = ({ chat, onSendMessage }) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || sending) return;

    const textToSend = message.trim();
    setMessage("");
    setSending(true);

    try {
      if (onSendMessage && chat) {
        await onSendMessage(chat, textToSend);
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setMessage(textToSend);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">

      <div className="flex gap-3">

        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          disabled={sending}
          className="flex-1 rounded-full bg-slate-100 dark:bg-slate-800 px-5 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none border border-slate-200 dark:border-slate-700 focus:border-indigo-500 transition disabled:opacity-50"
        />

        <button
          onClick={handleSend}
          disabled={sending || !message.trim()}
          className="rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 px-6 py-3 text-white font-bold text-sm shadow-md transition cursor-pointer"
        >
          {sending ? "Sending..." : "Send"}
        </button>

      </div>

    </div>
  );
};

export default ChatInput;