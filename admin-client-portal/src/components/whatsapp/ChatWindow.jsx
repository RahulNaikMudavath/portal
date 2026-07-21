import ChatHeader from "./ChatHeader";
import Conversation from "./Conversation";
import ChatInput from "./ChatInput";

const ChatWindow = ({ chat }) => {
  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500 font-medium bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        Select a conversation from the sidebar
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/95 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

      <ChatHeader chat={chat} />

      <div className="flex-1 overflow-y-auto bg-white/50 dark:bg-slate-950/40">

        <Conversation chat={chat} />

      </div>

      <ChatInput />

    </div>
  );
};

export default ChatWindow;