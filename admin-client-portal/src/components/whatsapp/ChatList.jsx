function ChatList({ chats, selected, onSelect }) {

    return (

        <div className="bg-slate-900 rounded-xl h-full overflow-y-auto">

            {chats.map(chat => (

                <div
                    key={chat.id}
                    onClick={() => onSelect(chat)}
                    className={`p-4 cursor-pointer border-b border-slate-700 ${
                        selected.id === chat.id
                            ? "bg-slate-800"
                            : ""
                    }`}
                >

                    <h3 className="text-white font-semibold">

                        {chat.name}

                    </h3>

                    <p className="text-slate-400 text-sm">

                        {chat.messages.at(-1)?.text || "Attachment"}

                    </p>

                </div>

            ))}

        </div>

    );

}

export default ChatList;