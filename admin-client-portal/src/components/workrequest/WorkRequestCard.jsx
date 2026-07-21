function WorkRequestCard({
  request,
  selected,
  onClick,
}) {
  const priorityColor = {
    urgent: "bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50",
    high: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
    medium: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/50",
    low: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50",
  };

  return (
    <div
      onClick={() => onClick(request)}
      className={`cursor-pointer rounded-2xl border p-5 transition-all duration-200 shadow-sm ${
        selected
          ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-slate-800/90"
          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-slate-700"
      }`}
    >
      <div className="flex justify-between items-start gap-2">

        <div>

          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {request.companyName || request.customerName}
          </h3>

          <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">
            {request.subject}
          </p>

        </div>

        <span
          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border uppercase ${
            priorityColor[request.priority] || priorityColor.medium
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

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-slate-700 px-3 py-1 text-xs text-white">
          📄 {request.attachments?.length || 0} Files
        </span>

        <span className="rounded-full bg-slate-700 px-3 py-1 text-xs text-white">
          💬 {request.conversation?.length || 0} Messages
        </span>

        <span className="rounded-full bg-slate-700 px-3 py-1 text-xs text-white">
          🏠 {request.projectType}
        </span>
      </div>

      <div className="mt-4">
        <span className="rounded-full bg-slate-700 px-3 py-1 text-xs text-white">
          {request.status}
        </span>
      </div>

    </div>
  );
}

export default WorkRequestCard;