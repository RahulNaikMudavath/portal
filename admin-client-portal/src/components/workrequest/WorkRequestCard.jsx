function WorkRequestCard({
  request,
  selected,
  onClick,
}) {
  const priorityColor = {
    urgent: "bg-red-600",
    high: "bg-orange-500",
    medium: "bg-yellow-500",
    low: "bg-green-500",
  };

  return (
    <div
      onClick={() => onClick(request)}
      className={`cursor-pointer rounded-2xl border p-5 transition-all duration-300
      ${
        selected
          ? "border-blue-500 bg-slate-800"
          : "border-slate-700 bg-slate-900 hover:border-slate-500"
      }`}
    >
      <div className="flex justify-between items-start">

        <div>

          <h3 className="text-lg font-bold text-white">
            {request.companyName || request.customerName}
          </h3>

          <p className="text-slate-400 mt-1">
            {request.subject}
          </p>

        </div>

        <span
          className={`text-xs px-2 py-1 rounded-full text-white ${
            priorityColor[request.priority]
          }`}
        >
          {request.priority}
        </span>

      </div>

      <div className="mt-4 flex gap-4 text-sm text-slate-400">

        <span>
          📄 {request.attachments?.length || 0}
        </span>

        <span>
          💬 {request.conversation?.length || 0}
        </span>

        <span>
          {new Date(request.createdAt).toLocaleDateString()}
        </span>

      </div>

      <div className="mt-4">

        <span
          className="rounded-full bg-slate-700 px-3 py-1 text-xs text-white"
        >
          {request.status}
        </span>

      </div>

    </div>
  );
}

export default WorkRequestCard;