import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

const Conversation = ({ chat }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500 font-medium">
        Select a conversation
      </div>
    );
  }

  const messages = chat.messages || [];

  return (
    <div className="flex flex-col gap-3.5 p-4 sm:p-6 min-h-full justify-end">
      {messages.length === 0 ? (
        <div className="text-center text-slate-400 dark:text-slate-500 font-medium my-auto py-12">
          💬 No messages in this conversation yet.
        </div>
      ) : (
        messages.map((msg, idx) => (
          <MessageBubble
            key={msg._id || msg.metaMessageId || `msg_${idx}`}
            message={msg}
          />
        ))
      )}
      <div ref={messagesEndRef} className="h-0" />
    </div>
  );
};

export default Conversation;