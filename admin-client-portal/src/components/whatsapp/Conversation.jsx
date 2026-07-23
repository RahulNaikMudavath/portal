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
    <div className="flex flex-col gap-3 p-6 overflow-y-auto h-full">
      {messages.map((msg, idx) => (
        <MessageBubble
          key={msg._id || msg.metaMessageId || `msg_${idx}`}
          message={msg}
        />
      ))}

      <div ref={messagesEndRef} />

      {messages.length === 0 && (
        <div className="text-center text-slate-400 dark:text-slate-500 font-medium my-auto py-12">
          💬 No messages in this conversation yet.
        </div>
      )}
    </div>
  );
};

export default Conversation;