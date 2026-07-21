import { useState, useEffect } from "react";

const getDeadlineInfo = (deadline, currentTime) => {
  if (!deadline) return null;

  const difference = new Date(deadline).getTime() - currentTime;

  if (difference <= 0) {
    return {
      overdue: true,
      label: "⚠️ OVERDUE",
    };
  }

  const totalSeconds = Math.floor(difference / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return {
    overdue: false,
    label: `⏳ ${days}d ${String(hours).padStart(2, "0")}h ${String(
      minutes
    ).padStart(2, "0")}m left`,
  };
};

const formatTime = (seconds = 0) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(secs).padStart(2, "0")}`;
};

const getPriorityStyle = (priority) => {
  switch (priority) {
    case "high":
    case "urgent":
      return "bg-red-500/25 text-red-400 border border-red-500/35";
    case "medium":
      return "bg-yellow-500/25 text-yellow-450 border border-yellow-500/35";
    default:
      return "bg-blue-500/25 text-blue-400 border border-blue-500/35";
  }
};

const getStatusStyle = (status) => {
  switch (status) {
    case "in-progress":
      return "bg-cyan-500/25 text-cyan-400 border border-cyan-500/35";
    case "completed":
      return "bg-emerald-500/25 text-emerald-400 border border-emerald-500/35";
    default:
      return "bg-slate-700/30 text-slate-350 border border-slate-700/50";
  }
};

const getNormalizedStatus = (dbStatus) => {
  if (!dbStatus || dbStatus === "assigned" || dbStatus === "pending" || dbStatus === "accepted") {
    return "pending";
  }
  if (dbStatus === "working" || dbStatus === "in-progress") {
    return "in-progress";
  }
  return "completed";
};

export default function TaskHeader({ task }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentTime, setCurrentTime] = useState(Date.now());

  const status = getNormalizedStatus(task?.status);

  // Updates deadline countdown automatically
  useEffect(() => {
    if (!task?.deadline) return;
    const deadlineInterval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(deadlineInterval);
  }, [task?.deadline]);

  // Updates persistent work timer while task is in-progress
  useEffect(() => {
    if (!task?.startedAt || status !== "in-progress") {
      return;
    }

    const updateTimer = () => {
      const startedTime = new Date(task.startedAt).getTime();
      setElapsedSeconds(
        Math.max(0, Math.floor((Date.now() - startedTime) / 1000))
      );
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);

    return () => clearInterval(timerInterval);
  }, [task?.startedAt, status]);

  const priority = task?.priority || "medium";
  const deadlineInfo = getDeadlineInfo(task?.deadline, currentTime);
  const createdDate = task?.createdAt ? new Date(task.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "N/A";
  const deadlineDate = task?.deadline ? new Date(task.deadline).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "N/A";

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-md space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        {/* Info badges and Title */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap gap-2 items-center">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${getPriorityStyle(priority)}`}>
              {priority}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusStyle(status)}`}>
              {status}
            </span>
            {task?.reviewStatus && (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                task.reviewStatus === "approved"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : task.reviewStatus === "rejected"
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-slate-800 text-slate-400 border border-slate-700"
              }`}>
                Review: {task.reviewStatus}
              </span>
            )}
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${task?.taskCategory === "field" ? "bg-emerald-500/20 text-emerald-400" : "bg-indigo-500/20 text-indigo-400"}`}>
              {task?.taskCategory === "field" ? "👷 Field" : "📄 Office"}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {task?.title}
          </h1>
        </div>

        {/* Status Badge right top */}
        <div className="text-right hidden md:block">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Category</p>
          <p className="text-sm font-bold text-slate-200 mt-1 capitalize">
            {task?.taskCategory} Workspace
          </p>
        </div>
      </div>

      {/* Grid Details Panel */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80 text-xs">
        <div>
          <span className="text-slate-500 uppercase font-semibold block mb-1">Customer</span>
          <span className="text-slate-200 font-bold">{task?.customerName || "N/A"}</span>
        </div>
        <div>
          <span className="text-slate-500 uppercase font-semibold block mb-1">Assigned Engineer</span>
          <span className="text-slate-200 font-bold">{task?.assignedTo?.name || "N/A"}</span>
        </div>
        <div>
          <span className="text-slate-500 uppercase font-semibold block mb-1">Created Date</span>
          <span className="text-slate-250 font-bold">{createdDate}</span>
        </div>
        <div>
          <span className="text-slate-500 uppercase font-semibold block mb-1">Target Deadline</span>
          <span className="text-slate-250 font-bold">{deadlineDate}</span>
        </div>
      </div>

      {/* Timer & Deadline Display */}
      {(status === "in-progress" || (status === "completed" && task?.totalTimeSpent > 0) || (task?.deadline && deadlineInfo)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
          {/* Running Timer */}
          {status === "in-progress" && task?.startedAt && (
            <div className="flex items-center gap-3.5 bg-blue-500/10 border border-blue-500/25 rounded-2xl p-4">
              <span className="text-2xl animate-pulse">⏱️</span>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-blue-400">Work Timer Running</p>
                <p className="text-xl font-bold text-white tracking-widest mt-0.5">
                  {formatTime(elapsedSeconds)}
                </p>
              </div>
            </div>
          )}

          {/* Final Completed Duration */}
          {status === "completed" && task?.totalTimeSpent > 0 && (
            <div className="flex items-center gap-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-4">
              <span className="text-2xl">⏱️</span>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Total Work Duration</p>
                <p className="text-xl font-bold text-white tracking-widest mt-0.5">
                  {formatTime(task.totalTimeSpent)}
                </p>
              </div>
            </div>
          )}

          {/* Deadline Countdown */}
          {task?.deadline && deadlineInfo && status !== "completed" && (
            <div className={`flex items-center gap-3.5 rounded-2xl p-4 border ${
              deadlineInfo.overdue
                ? "bg-red-500/10 border-red-500/25 text-red-400"
                : "bg-indigo-500/10 border-indigo-500/25 text-slate-300"
            }`}>
              <span className="text-2xl">📅</span>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Deadline Countdown</p>
                <p className="text-sm font-semibold text-white mt-0.5 flex items-center gap-1.5">
                  {deadlineInfo.label}
                  {!deadlineInfo.overdue && (
                    <span className="text-[11px] text-slate-400 font-normal">
                      · Due {deadlineDate}
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
