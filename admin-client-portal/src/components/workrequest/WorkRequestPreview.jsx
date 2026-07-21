import AssignEngineerModal from "./AssignEngineerModal";
import { convertWorkRequest } from "../../services/workRequestService";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function WorkRequestPreview({ request }) {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
  if (!request) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-sm">
        <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
          Select a Work Request to preview details
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 shadow-sm">

      {/* Header */}

      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {request.companyName}
            </h1>

            <p className="mt-1.5 text-base font-semibold text-slate-600 dark:text-slate-300">
              {request.subject}
            </p>

            <p className="mt-2 text-xs font-mono text-slate-400 dark:text-slate-500">
              ID: {request.requestId}
            </p>
          </div>

          <span
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider
            ${
              request.priority === "urgent"
                ? "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900"
                : request.priority === "high"
                ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900"
                : "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900"
            }
            `}
          >
            {request.priority}
          </span>
        </div>
      </div>

      {/* Customer Grid */}

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 p-4">
          <span className="text-lg">📞</span>

          <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">Phone</p>

          <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">{request.phoneNumber}</p>
        </div>

        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 p-4">
          <span className="text-lg">🏢</span>

          <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">Company</p>

          <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">{request.companyName}</p>
        </div>

        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 p-4">
          <span className="text-lg">📍</span>

          <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">Site Address</p>

          <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
            {request.siteAddress || "Not Provided"}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 p-4">
          <span className="text-lg">📅</span>

          <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">Created Date</p>

          <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
            {new Date(request.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Conversation */}

      <div className="mt-8">

        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          💬 Conversation History
        </h3>

        <div className="space-y-4">

          {request.conversation?.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.sender === "Customer"
                  ? "justify-start"
                  : "justify-end"
              }`}
            >

              <div
                className={`max-w-[85%] rounded-2xl p-4 shadow-xs border ${
                  msg.sender === "Customer"
                    ? "bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700"
                    : "bg-indigo-600 text-white border-indigo-700"
                }`}
              >

                <div className="flex justify-between items-center mb-1.5 gap-4">

                  <p className={`text-xs font-bold ${
                    msg.sender === "Customer"
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-indigo-100"
                  }`}>
                    {msg.sender}
                  </p>

                  <p className="text-[10px] opacity-70">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>

                </div>

                <p className="text-xs leading-relaxed whitespace-pre-wrap">
                  {msg.message}
                </p>

              </div>

            </div>
          ))}

        </div>

      </div>

      <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-8 mb-4">
        📎 Attachments
      </h3>

      <div className="space-y-3">

      {request.attachments?.map((file,index)=>(

      <div
      key={index}
      className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-700"
      >

      <div>

      <p className="text-sm font-bold text-slate-900 dark:text-white">
        📄 {file.fileName}
      </p>

      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
        {(file.size/1024).toFixed(0)} KB
      </p>

      </div>

<div className="flex gap-3">

<a

href={file.url}

target="_blank"

rel="noreferrer"

className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700"

>

Preview

</a>

<a

href={file.url}

download

className="bg-slate-700 px-4 py-2 rounded-lg hover:bg-slate-600"

>

Download

</a>

</div>

</div>

))}

</div>

      {/* Attachments */}

      <div className="mt-8">

        <h3 className="font-semibold text-white">
          Attachments
        </h3>

        <div className="mt-4 space-y-2">

          {(request.attachments || []).map(
            (file, index) => (

              <div
                key={index}
                className="flex items-center justify-between rounded-lg bg-slate-800 p-3"
              >

                <span className="text-white">
                  📄 {file.fileName}
                </span>

                <button className="text-blue-400 hover:text-blue-300">
                  Open
                </button>

              </div>

            )
          )}

        </div>

      </div>
      <div className="mt-10 rounded-2xl border border-cyan-500 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 p-6">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🤖</div>

          <div>
            <h3 className="text-xl font-bold text-cyan-300">AI Analysis</h3>

            <p className="text-slate-400">Generated automatically</p>
          </div>
        </div>

        <div className="mt-6">
          <p className="leading-8 text-white">{request.aiSummary}</p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="mb-5 text-xl font-bold text-white">⚡ Quick Actions</h2>

        <div className="grid grid-cols-2 gap-4">
          <button
    onClick={() => {
    console.log("BUTTON CLICKED");
    setShowModal(true);
}}
    className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl"
>
    👷 Assign Engineer
</button>

          <button className="rounded-xl bg-green-600 p-4 hover:bg-green-700">
            📞 Call Customer
          </button>

          <button className="rounded-xl bg-emerald-600 p-4 hover:bg-emerald-700">
            💬 Open WhatsApp
          </button>

          <button
            onClick={() => {
              navigator.clipboard.writeText(request.phoneNumber);
            }}
            className="rounded-xl bg-slate-700 p-4 hover:bg-slate-600"
          >
            📋 Copy Number
          </button>
        </div>
      </div>

      
      <AssignEngineerModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onAssign={async (data) => {
    try {

      await convertWorkRequest(request._id, {
        assignedEngineer: data.assignedEngineer,
        priority: data.priority,
        deadline: data.deadline,
        budget: data.budget,
        notes: data.notes,
      });

      alert("✅ Work Order Created Successfully!");

      setShowModal(false);

      navigate("/admin/tasks");

    } catch (err) {

      console.error(err);

      alert(
        err.response?.data?.message ||
        "Failed to assign engineer."
      );

      throw err;

    }
  }}
/>
      
      <div className="mt-10">

<h2 className="text-xl font-bold text-white mb-5">

📊 Work Insights

</h2>

<div className="grid grid-cols-2 gap-4">

<div className="bg-slate-800 rounded-xl p-4">

<p className="text-slate-400 text-sm">

Priority

</p>

<p className="text-white font-bold mt-2">

{request.priority}

</p>

</div>

<div className="bg-slate-800 rounded-xl p-4">

<p className="text-slate-400 text-sm">

Documents

</p>

<p className="text-white font-bold mt-2">

{request.attachments?.length || 0}

</p>

</div>

<div className="bg-slate-800 rounded-xl p-4">

<p className="text-slate-400 text-sm">

Messages

</p>

<p className="text-white font-bold mt-2">

{request.conversation?.length || 0}

</p>

</div>

<div className="bg-slate-800 rounded-xl p-4">

<p className="text-slate-400 text-sm">

Project Type

</p>

<p className="text-white font-bold mt-2">

{request.projectType}

</p>

</div>

</div>

</div>

<div className="mt-10">

<h2 className="text-xl font-bold text-white mb-5">

📈 Activity Timeline

</h2>

<div className="space-y-5 border-l-2 border-slate-700 ml-3 pl-6">

<div>

<p className="text-white">

📄 Work Request Created

</p>

<p className="text-slate-400 text-sm">

{new Date(request.createdAt).toLocaleString()}

</p>

</div>

<div>

<p className="text-white">

🤖 AI Summary Generated

</p>

<p className="text-slate-400 text-sm">

Automatically after upload

</p>

</div>

<div>

<p className="text-white">

📎 Documents Attached

</p>

<p className="text-slate-400 text-sm">

{request.attachments.length} file(s)

</p>

</div>

</div>

</div>

    </div>
    
  );
}

export default WorkRequestPreview;