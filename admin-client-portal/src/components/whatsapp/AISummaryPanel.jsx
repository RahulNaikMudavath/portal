import { useNavigate } from "react-router-dom";
import { useWorkRequest } from "../../context/WorkRequestContext";

const AISummaryPanel = ({ chat }) => {
    const navigate = useNavigate();
    const { setDraftRequest } = useWorkRequest();

    if (!chat) {
        return (
            <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500 font-medium bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
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
        <div className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col rounded-2xl shadow-sm overflow-hidden">

            {/* Header */}

            <div className="border-b border-slate-200 dark:border-slate-800 p-5 bg-slate-50/50 dark:bg-slate-800/40">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    🤖 AI Assistant
                </h2>
            </div>

            {/* Body */}

            <div className="flex-1 overflow-y-auto p-5 space-y-5">

                {/* Customer */}

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Customer
                    </p>

                    <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                        {customerName}
                    </p>
                </div>

                {/* AI Extracted Details Grid */}

                <div className="grid grid-cols-2 gap-3 text-xs">

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                        <h4 className="font-semibold text-slate-500 dark:text-slate-400 uppercase text-[10px]">Project</h4>
                        <p className="font-bold text-slate-900 dark:text-white mt-1">
                            {chat.ai?.projectType || "Not detected"}
                        </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                        <h4 className="font-semibold text-slate-500 dark:text-slate-400 uppercase text-[10px]">Service</h4>
                        <p className="font-bold text-slate-900 dark:text-white mt-1">
                            {chat.ai?.subject || "General Work Request"}
                        </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                        <h4 className="font-semibold text-slate-500 dark:text-slate-400 uppercase text-[10px]">Floors</h4>
                        <p className="font-bold text-slate-900 dark:text-white mt-1">
                            {chat.ai?.floors || "Not detected"}
                        </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                        <h4 className="font-semibold text-slate-500 dark:text-slate-400 uppercase text-[10px]">Budget</h4>
                        <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                            {chat.ai?.estimatedBudget || "Not detected"}
                        </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                        <h4 className="font-semibold text-slate-500 dark:text-slate-400 uppercase text-[10px]">Priority</h4>
                        <p className="font-bold text-rose-600 dark:text-rose-400 capitalize mt-1">
                            {priority}
                        </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                        <h4 className="font-semibold text-slate-500 dark:text-slate-400 uppercase text-[10px]">Suggested Engineer</h4>
                        <p className="font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                            {chat.ai?.suggestedEngineer || "Not Assigned"}
                        </p>
                    </div>

                </div>

                {/* AI Summary Card */}

                <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-slate-800/60 border border-indigo-100 dark:border-slate-700/60 space-y-1">
                    <p className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">
                        ✨ AI Summary Overview
                    </p>

                    <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap pt-1">
                        {summary}
                    </p>
                </div>

                {/* Attachments */}

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Attachments
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                            {attachmentCount === 0
                                ? "No files attached"
                                : `${attachmentCount} file${attachmentCount > 1 ? "s" : ""} uploaded`}
                        </p>
                    </div>
                    <span className="text-lg font-bold text-slate-900 dark:text-white px-2.5 py-1 bg-slate-200 dark:bg-slate-700 rounded-lg">
                        {attachmentCount}
                    </span>
                </div>

            </div>

            {/* Footer Buttons */}

            <div className="border-t border-slate-200 dark:border-slate-800 p-5 space-y-2.5 bg-slate-50/40 dark:bg-slate-900/60">

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
                    className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl p-3 font-bold text-xs text-white transition shadow-sm cursor-pointer"
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
                    className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 font-bold text-xs text-white transition shadow-sm cursor-pointer"
                >
                    👷 Assign Engineer
                </button>

            </div>

        </div>
    );
};

export default AISummaryPanel;