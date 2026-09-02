import { useState } from "react";

const ChatInput = ({ chat, onSendMessage }) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const handleSend = async () => {
    if (!message.trim() || sending) return;

    const textToSend = message.trim();
    setMessage("");
    setSendError("");
    setSending(true);

    try {
      if (onSendMessage && chat) {
        await onSendMessage(chat, textToSend);
      }
    } catch (err) {
      console.error("Error sending message:", err);
      const errorDetail =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to send message via WhatsApp Meta API.";
      setSendError(errorDetail);
      setMessage(textToSend); // Retain unsent message
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      {sendError && (
        <div className="mb-3 flex items-start justify-between gap-2 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300">
          <div className="flex items-center gap-2">
            <span className="font-bold">⚠️ Send Failed:</span>
            <span>{sendError}</span>
          </div>
          <button
            onClick={() => setSendError("")}
            className="text-red-500 hover:text-red-700 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex gap-3">
        <input
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (sendError) setSendError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
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