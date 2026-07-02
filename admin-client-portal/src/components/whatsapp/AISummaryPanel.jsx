const AISummaryPanel = ({ chat }) => {

    if (!chat) {

        return (

            <div className="flex items-center justify-center h-full text-slate-500">

                No Chat Selected

            </div>

        );

    }

    const attachmentCount = Array.isArray(chat?.attachments) ? chat.attachments.length : 0;
    const customerName = chat.customerName?.trim() || "Unknown customer";
    const subject = chat.subject?.trim() || "No subject available";
    const priority = chat.priority?.trim() || "Normal";
    const summary = chat.aiSummary?.trim() || "No AI summary generated yet.";

    return (

        <div className="h-full bg-[#111827] flex flex-col">

            <div className="border-b border-slate-700 p-5">

                <h2 className="text-2xl font-bold text-white">

                    🤖 AI Assistant

                </h2>

            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">

                <div>

                    <p className="text-sm text-slate-400">

                        Customer

                    </p>

                    <p className="text-white font-semibold">

                        {customerName}

                    </p>

                </div>

                <div>

                    <p className="text-sm text-slate-400">

                        Subject

                    </p>

                    <p className="text-white">

                        {subject}

                    </p>

                </div>

                <div>

                    <p className="text-sm text-slate-400">

                        Priority

                    </p>

                    <span className="inline-block mt-1 rounded-full bg-red-600 px-3 py-1 text-sm">

                        {priority}

                    </span>

                </div>

                <div>

                    <p className="text-sm text-slate-400">

                        AI Summary

                    </p>

                    <div className="mt-2 rounded-xl bg-slate-800 p-4">

                        <p className="text-slate-300 leading-7">

                            {summary}

                        </p>

                    </div>

                </div>

                <div>

                    <p className="text-sm text-slate-400">

                        Attachments

                    </p>

                    <p className="text-white">

                        {attachmentCount}

                    </p>

                    <p className="mt-1 text-sm text-slate-400">

                        {attachmentCount === 0

                            ? "No attachments uploaded yet."

                            : `${attachmentCount} file${attachmentCount === 1 ? "" : "s"} attached`}

                    </p>

                </div>

            </div>

            <div className="border-t border-slate-700 p-5 space-y-3">

                <button

                    className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"

                >

                    📋 Create Work Request

                </button>

                <button

                    className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white hover:bg-green-700"

                >

                    👷 Assign Engineer

                </button>

            </div>

        </div>

    );

};

export default AISummaryPanel;