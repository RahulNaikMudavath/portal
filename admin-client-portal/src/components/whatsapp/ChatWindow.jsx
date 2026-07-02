import ChatHeader from "./ChatHeader";
import Conversation from "./Conversation";
import ChatInput from "./ChatInput";

const ChatWindow = ({ chat }) => {
  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        Select a chat
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0f172a]">

      <ChatHeader chat={chat} />

      <div className="flex-1 overflow-y-auto">

        <Conversation chat={chat} />

      </div>

      <ChatInput />

    </div>
  );
};

export default ChatWindow;