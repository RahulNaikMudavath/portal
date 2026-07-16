import { motion } from "framer-motion";

const getPriorityStyle = (priority) => {
  switch (priority) {
    case "high":
    case "urgent":
      return "bg-red-500/10 text-red-400 border border-red-500/20";
    case "medium":
      return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
    default:
      return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
  }
};

const getStatusStyle = (status) => {
  switch (status) {
    case "in-progress":
      return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20";
    case "completed":
      return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    default:
      return "bg-slate-800 text-slate-400 border border-slate-700/50";
  }
};

export default function TaskCard({ task, isActive, onClick }) {
  const priority = task?.priority || "medium";
  const status = task?.status || "pending";
  const progress = task?.progress || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`group relative rounded-2xl border p-5 transition-all duration-300 cursor-pointer hover:shadow-md ${
        isActive
          ? "bg-slate-800/80 border-indigo-500/60 shadow-indigo-950/20"
          : "bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700"
      }`}
    >
      {/* Decorative vertical bar for active item */}
      {isActive && (
        <span className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-md bg-indigo-500" />
      )}

      <div className="space-y-3">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getPriorityStyle(priority)}`}>
            {priority}
          </span>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(status)}`}>
            {status}
          </span>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${task?.taskCategory === "field" ? "bg-emerald-500/10 text-emerald-400" : "bg-indigo-500/10 text-indigo-400"}`}>
            {task?.taskCategory === "field" ? "👷 Field" : "📄 Office"}
          </span>
        </div>

        {/* Task Title & Description snippet */}
        <div>
          <h4 className="text-base font-bold text-white leading-snug group-hover:text-indigo-400 transition duration-200 truncate">
            {task?.title}
          </h4>
          <p className="text-xs text-slate-450 mt-1 line-clamp-2 leading-relaxed">
            {task?.description || "No description provided."}
          </p>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[11px] font-medium">
            <span className="text-slate-400">Completion</span>
            <span className="text-slate-350">{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              style={{ width: `${progress}%` }}
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
            />
          </div>
        </div>

        {/* Footer date metadata */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
          <span>Created {new Date(task?.createdAt).toLocaleDateString("en-IN")}</span>
          {task?.deadline && (
            <span className="text-yellow-500/80">
              Due {new Date(task.deadline).toLocaleDateString("en-IN")}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
