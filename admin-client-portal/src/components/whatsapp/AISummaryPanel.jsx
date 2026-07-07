import { useNavigate } from "react-router-dom";
import { useWorkRequest } from "../../context/WorkRequestContext";

const AISummaryPanel = ({ chat }) => {
    const navigate = useNavigate();
    const { setDraftRequest } = useWorkRequest();

    if (!chat) {
        return (
            <div className="flex items-center justify-center h-full text-slate-500">
                No Chat Selected
            </div>
        );
    }

    const attachmentCount = Array.isArray(chat.attachments)
        ? chat.attachments.length
        : 0;

    const customerName = chat.customerName?.trim() || "Unknown Customer";

    const priority =
        chat.ai?.priority ||
        chat.priority ||
        "Normal";

    const summary =
        chat.ai?.summary ||
        chat.aiSummary ||
        "No AI summary generated yet.";

    return (
        <div className="h-full bg-[#111827] flex flex-col">

            {/* Header */}

            <div className="border-b border-slate-700 p-5">
                <h2 className="text-2xl font-bold text-white">
                    🤖 AI Assistant
                </h2>
            </div>

            {/* Body */}

            <div className="flex-1 overflow-y-auto p-5 space-y-5">

                {/* Customer */}

                <div>
                    <p className="text-sm text-slate-400">
                        Customer
                    </p>

                    <p className="text-white font-semibold">
                        {customerName}
                    </p>
                </div>

                {/* AI Extracted Details */}

                <div className="space-y-4">

                    <div>
                        <h4 className="text-gray-400">Project</h4>
                        <p className="text-white">
                            {chat.ai?.projectType || "Not detected"}
                        </p>
                    </div>

                    <div>
                        <h4 className="text-gray-400">Service</h4>
                        <p className="text-white">
                            {chat.ai?.subject || "General Work Request"}
                        </p>
                    </div>

                    <div>
                        <h4 className="text-gray-400">Floors</h4>
                        <p className="text-white">
                            {chat.ai?.floors || "Not detected"}
                        </p>
                    </div>

                    <div>
                        <h4 className="text-gray-400">Budget</h4>
                        <p className="text-green-400">
                            {chat.ai?.estimatedBudget || "Not detected"}
                        </p>
                    </div>

                    <div>
                        <h4 className="text-gray-400">Priority</h4>
                        <p className="text-red-400 capitalize">
                            {priority}
                        </p>
                    </div>

                    <div>
                        <h4 className="text-gray-400">Suggested Engineer</h4>
                        <p className="text-cyan-400">
                            {chat.ai?.suggestedEngineer || "Not Assigned"}
                        </p>
                    </div>

                    <div>
                        <h4 className="text-gray-400">Summary</h4>

                        <p className="text-sm leading-6 text-white whitespace-pre-wrap">
                            {summary}
                        </p>
                    </div>

                </div>

                {/* Priority Badge */}

                <div>
                    <p className="text-sm text-slate-400">
                        Priority
                    </p>

                    <span className="inline-block mt-2 rounded-full bg-red-600 px-3 py-1 text-sm text-white">
                        {priority}
                    </span>
                </div>

                {/* AI Summary */}

                <div>
                    <p className="text-sm text-slate-400">
                        AI Summary
                    </p>

                    <div className="mt-2 rounded-xl bg-slate-800 p-4">
                        <p className="text-slate-300 leading-7 whitespace-pre-wrap">
                            {summary}
                        </p>
                    </div>
                </div>

                {/* Attachments */}

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
                            : `${attachmentCount} file${attachmentCount > 1 ? "s" : ""} attached`}
                    </p>

                </div>

            </div>

            {/* Footer Buttons */}

            <div className="border-t border-slate-700 p-5 space-y-3">

                <button
                    onClick={() => {

                        setDraftRequest({

                            _id: chat.workRequestId || null,

                            customerName: chat.customerName,

                            phoneNumber: chat.phoneNumber,

                            projectType: chat.ai?.projectType,

                            priority: priority,

                            subject: chat.ai?.subject,

                            estimatedBudget: chat.ai?.estimatedBudget,

                            description: summary,

                            preferredEngineer: chat.ai?.suggestedEngineer

                        });

                        navigate("/admin/create-ai-request");

                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg p-3 font-semibold text-white"
                >
                    📋 Create Work Request
                </button>

                <button
                    onClick={() => {

                        setDraftRequest({

                            _id: chat.workRequestId || null,

                            customerName: chat.customerName,

                            phoneNumber: chat.phoneNumber,

                            projectType: chat.ai?.projectType,

                            priority: priority,

                            subject: chat.ai?.subject,

                            estimatedBudget: chat.ai?.estimatedBudget,

                            description: summary,

                            preferredEngineer: chat.ai?.suggestedEngineer

                        });

                        navigate("/admin/create");

                    }}
                    className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white hover:bg-green-700"
                >
                    👷 Assign Engineer
                </button>

            </div>

        </div>
    );
};

export default AISummaryPanel;