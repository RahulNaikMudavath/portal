import { useState } from "react";
import AssignWorkModal from "./AssignWorkModal";

function WorkRequestPreview({ request }) {
    const [showAssign, setShowAssign] = useState(false);
  if (!request) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-slate-700 bg-slate-900">
        <p className="text-slate-400">
          Select a Work Request
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-7">

      {/* Header */}

      <div className="border-b border-slate-700 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">
              {request.companyName}
            </h1>

            <p className="mt-2 text-lg text-slate-400">
              {request.subject}
            </p>

            <p className="mt-3 text-sm text-slate-500">
              {request.requestId}
            </p>
          </div>

          <span
            className={`rounded-full px-4 py-2 text-sm font-semibold
            ${
              request.priority === "urgent"
                ? "bg-red-500/20 text-red-400"
                : request.priority === "high"
                ? "bg-orange-500/20 text-orange-400"
                : "bg-blue-500/20 text-blue-400"
            }
            `}
          >
            {request.priority.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Customer */}

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-slate-800 p-4">
          📞

          <p className="mt-1 text-sm text-slate-400">Phone</p>

          <p className="mt-1 text-white">{request.phoneNumber}</p>
        </div>

        <div className="rounded-xl bg-slate-800 p-4">
          🏢

          <p className="mt-1 text-sm text-slate-400">Company</p>

          <p className="mt-1 text-white">{request.companyName}</p>
        </div>

        <div className="rounded-xl bg-slate-800 p-4">
          📍

          <p className="mt-1 text-sm text-slate-400">Site</p>

          <p className="mt-1 text-white">
            {request.siteAddress || "Not Provided"}
          </p>
        </div>

        <div className="rounded-xl bg-slate-800 p-4">
          📅

          <p className="mt-1 text-sm text-slate-400">Created</p>

          <p className="mt-1 text-white">
            {new Date(request.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Conversation */}

      <div className="mt-8">

        <h3 className="font-semibold text-xl mt-10 mb-5 flex items-center gap-2">
          💬 Conversation
        </h3>

        <div className="space-y-5">

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
                className={`max-w-[80%] rounded-2xl px-5 py-4 shadow-lg

${
                  msg.sender === "Customer"
                    ? "bg-slate-800 border border-slate-700"
                    : "bg-blue-600"
                }

`}
              >

                <div className="flex justify-between items-center mb-2">

                  <p className={`font-semibold

${
                    msg.sender === "Customer"
                      ? "text-blue-400"
                      : "text-white"
                  }

`}>

                    {msg.sender}

                  </p>

                  <p className="text-xs text-slate-400">

                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}

                  </p>

                </div>

                <p className="text-white whitespace-pre-wrap">

                  {msg.message}

                </p>

              </div>

            </div>
          ))}

        </div>

      </div>
      <h3 className="font-semibold text-xl mt-10 mb-5">
📎 Attachments
</h3>

<div className="space-y-4">

{request.attachments?.map((file,index)=>(

<div
key={index}
className="flex justify-between items-center bg-slate-800 rounded-2xl p-5 border border-slate-700"
>

<div>

<p className="text-white font-semibold">

📄 {file.fileName}

</p>

<p className="text-slate-400 text-sm">

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
          <button className="rounded-xl bg-blue-600 p-4 hover:bg-blue-700">
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

      <AssignWorkModal
        open={showAssign}
        onClose={() => setShowAssign(false)}
        request={request}
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