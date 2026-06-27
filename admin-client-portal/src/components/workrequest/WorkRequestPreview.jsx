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

      <div className="border-b border-slate-700 pb-5">

        <h2 className="text-3xl font-bold text-white">
          {request.companyName}
        </h2>

        <p className="mt-2 text-slate-400">
          {request.subject}
        </p>

      </div>

      {/* Customer */}

      <div className="mt-6">

        <h3 className="font-semibold text-white">
          Customer Details
        </h3>

        <div className="mt-3 space-y-2 text-slate-300">

          <p>
            👤 {request.customerName}
          </p>

          <p>
            📞 {request.phoneNumber || "Not Available"}
          </p>

          <p>
            📍 {request.siteAddress || "No Address"}
          </p>

        </div>

      </div>

      {/* Conversation */}

      <div className="mt-8">

        <h3 className="font-semibold text-white">
          Conversation
        </h3>

        <div className="mt-4 space-y-3">

          {(request.conversation || []).map(
            (message, index) => (

              <div
                key={index}
                className="rounded-xl bg-slate-800 p-3"
              >

                <p className="text-sm text-blue-400">
                  {message.sender}
                </p>

                <p className="mt-2 text-white">
                  {message.message}
                </p>

              </div>

            )
          )}

        </div>

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

      {/* AI */}

      <div className="mt-8 rounded-xl border border-purple-500/20 bg-purple-500/10 p-5">

        <h3 className="text-purple-300 font-semibold">
          🤖 AI Summary
        </h3>

        <p className="mt-3 text-slate-300">
          {request.aiSummary ||
            "AI summary will appear here."}
        </p>

      </div>

      <div className="mt-8">

        <button
          onClick={() => setShowAssign(true)}
          className="rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          Assign Engineer
        </button>

      </div>

      <AssignWorkModal
        open={showAssign}
        onClose={() => setShowAssign(false)}
        request={request}
      />

    </div>
  );
}

export default WorkRequestPreview;