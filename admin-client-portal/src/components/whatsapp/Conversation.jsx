import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import WhatsAppWallpaper from "./WhatsAppWallpaper";

const formatDateLabel = (dateStr) => {
  if (!dateStr) return "TODAY";
  const date = new Date(dateStr);
  const now = new Date();
  
  if (date.toDateString() === now.toDateString()) {
    return "TODAY";
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "YESTERDAY";
  }

  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).toUpperCase();
};

const Conversation = ({ chat, onReply, isTyping = false }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages, isTyping]);

  if (!chat) {
    return (
      <div className="relative flex items-center justify-center h-full text-slate-400 dark:text-slate-500 font-medium bg-[#efeae2] dark:bg-[#0b141a]">
        <WhatsAppWallpaper />
        <span className="relative z-10 px-4 py-2 rounded-xl bg-white/80 dark:bg-slate-900/80 shadow-xs border border-slate-200 dark:border-slate-800 text-xs">
          Select a conversation from the sidebar
        </span>
      </div>
    );
  }

  const messages = chat.messages || [];

  // Group messages by date to render WhatsApp centered date badges
  let lastDateLabel = "";

  return (
    <div className="relative min-h-full flex flex-col justify-end p-4 sm:p-6 bg-[#efeae2] dark:bg-[#0b141a] overflow-hidden select-text">
      {/* Authentic WhatsApp Doodle Pattern */}
      <WhatsAppWallpaper />

      <div className="relative z-10 flex flex-col gap-1 min-h-full justify-end">
        {messages.length === 0 ? (
          <div className="text-center my-auto py-12">
            <span className="inline-block px-4 py-2 rounded-2xl bg-white/90 dark:bg-slate-900/90 text-slate-500 dark:text-slate-400 text-xs shadow-sm border border-slate-200/80 dark:border-slate-800">
              🔒 Messages and calls are end-to-end encrypted. No one outside of this chat can read them.
            </span>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const dateLabel = formatDateLabel(msg.createdAt);
            const showDateHeader = dateLabel !== lastDateLabel;
            if (showDateHeader) {
              lastDateLabel = dateLabel;
            }

            return (
              <div key={msg._id || msg.metaMessageId || `msg_${idx}`} className="flex flex-col">
                {showDateHeader && (
                  <div className="flex justify-center my-3 select-none">
                    <span className="px-3 py-1 rounded-lg bg-white/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 text-[10.5px] font-bold tracking-wider uppercase shadow-xs border border-slate-200/70 dark:border-slate-700/60">
                      {dateLabel}
                    </span>
                  </div>
                )}
                <MessageBubble
                  message={msg}
                  onReply={onReply}
                />
              </div>
            );
          })
        )}

        {/* Live Customer Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 mb-2 select-none">
            <div className="px-4 py-2.5 rounded-2xl rounded-tl-xs bg-white dark:bg-[#202c33] border border-slate-200/80 dark:border-[#222e35] shadow-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="h-0" />
      </div>
    </div>
  );
};

export default Conversation;