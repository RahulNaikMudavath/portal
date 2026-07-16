import { useMemo } from "react";
import { motion } from "framer-motion";

export default function TimelineCard({ task }) {
  const events = useMemo(() => {
    if (!task) return [];

    // If backend has the database activityLog, use it!
    if (task.activityLog && task.activityLog.length > 0) {
      return task.activityLog.map((log, idx) => {
        let color = "bg-slate-700";
        if (log.action.toLowerCase().includes("assign")) color = "bg-indigo-500";
        else if (log.action.toLowerCase().includes("start")) color = "bg-blue-650";
        else if (log.action.toLowerCase().includes("progress")) color = "bg-indigo-500";
        else if (log.action.toLowerCase().includes("submit")) color = "bg-yellow-600";
        else if (log.action.toLowerCase().includes("approved")) color = "bg-emerald-600";
        else if (log.action.toLowerCase().includes("rejected")) color = "bg-red-650";

        return {
          id: log._id || `log-${idx}`,
          title: log.action,
          description: log.remarks || "",
          time: new Date(log.createdAt),
          icon: log.icon || "📋",
          color: color,
          user: log.user,
        };
      }).sort((a, b) => b.time.getTime() - a.time.getTime()); // newest first
    }

    // Fallback: build log from other schema milestones
    const list = [];
    
    list.push({
      id: "created",
      title: "Task Assigned",
      description: "Task was created and assigned to engineer.",
      time: new Date(task.createdAt),
      icon: "📋",
      color: "bg-slate-700",
      user: task.assignedTo
    });

    if (task.startedAt) {
      list.push({
        id: "started",
        title: "Task Started",
        description: "Work timer was activated by client.",
        time: new Date(task.startedAt),
        icon: "🚀",
        color: "bg-blue-655",
        user: task.assignedTo
      });
    }

    if (task.progressUpdates && task.progressUpdates.length > 0) {
      task.progressUpdates.forEach((up, idx) => {
        list.push({
          id: `progress-${idx}`,
          title: `Progress Update`,
          description: up.message || `Progress increased to ${up.percentage}%.`,
          time: new Date(up.createdAt),
          icon: "📈",
          color: "bg-indigo-500",
          user: task.assignedTo
        });
      });
    }

    if (task.submittedAt) {
      list.push({
        id: "submitted",
        title: "Work Submitted",
        description: "Task files uploaded and sent for approval.",
        time: new Date(task.submittedAt),
        icon: "📤",
        color: "bg-yellow-600",
        user: task.assignedTo
      });
    }

    if (task.reviewStatus === "approved") {
      list.push({
        id: "approved",
        title: "Task Approved",
        description: "Work review approved. Task successfully finalized.",
        time: task.updatedAt ? new Date(task.updatedAt) : new Date(),
        icon: "✅",
        color: "bg-emerald-600",
      });
    } else if (task.reviewStatus === "rejected") {
      list.push({
        id: "rejected",
        title: "Task Rejected",
        description: "Task needs review. Re-submit work files.",
        time: task.updatedAt ? new Date(task.updatedAt) : new Date(),
        icon: "⚠️",
        color: "bg-red-600",
      });
    }

    return list.sort((a, b) => b.time.getTime() - a.time.getTime()); // newest first
  }, [task]);

  if (events.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition-all duration-300 hover:border-slate-700 hover:shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>📅</span> Activity Timeline
        </h3>
        <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-850 text-slate-400">
          {events.length} Events
        </span>
      </div>

      <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-6">
        {events.map((event, idx) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.05 }}
            className="relative"
          >
            {/* Circle Node Pin */}
            <span className={`absolute -left-[35px] top-1 flex h-6 w-6 items-center justify-center rounded-full text-xs shadow-md ${event.color} text-white border border-slate-950`}>
              {event.icon}
            </span>

            {/* Event Details */}
            <div className="space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="text-xs font-bold text-white">{event.title}</span>
                <span className="text-[9px] text-slate-500 font-mono">
                  {event.time.toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                </span>
              </div>

              {event.description && (
                <p className="text-[11px] text-slate-400 italic bg-slate-950/40 border border-slate-850 rounded-lg p-2 mt-1 leading-relaxed">
                  {event.description}
                </p>
              )}

              {event.user && (
                <p className="text-[9px] text-slate-500 font-bold pt-0.5">
                  Performed by: {event.user.name || event.user.email || "System/Engineer"}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
