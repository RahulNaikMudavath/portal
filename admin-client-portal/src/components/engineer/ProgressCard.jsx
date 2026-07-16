import { motion } from "framer-motion";

export default function ProgressCard({ task, onUpdate }) {
  const progress = task?.progress || 0;
  const remaining = 100 - progress;
  const isInProgress = task?.status === "in-progress";

  // Last Updated timestamp from the latest progress updates log
  const progressUpdates = task?.progressUpdates || [];
  const latestUpdate = progressUpdates.length > 0 ? progressUpdates[progressUpdates.length - 1] : null;
  const lastUpdatedText = latestUpdate
    ? new Date(latestUpdate.updatedAt || Date.now()).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : task?.updatedAt
    ? new Date(task.updatedAt).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Not updated yet";

  // Estimated completion status
  const getEstimatedStatus = () => {
    if (progress === 100) return "Completed";
    if (!task?.deadline) return "On Demand / No Deadline";
    const timeLeft = new Date(task.deadline).getTime() - Date.now();
    if (timeLeft < 0) return "Overdue (Needs Action)";
    if (progress >= 75) return "On track for early completion";
    if (progress >= 50) return "On Track";
    return "Acceleration recommended";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-slate-900 rounded-2xl p-6 border border-slate-800 transition-all duration-300 hover:border-slate-700 hover:shadow-lg space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg text-white font-bold flex items-center gap-2">
          <span>📈</span> Task Progress
        </h2>
        {isInProgress && onUpdate && (
          <button
            onClick={onUpdate}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider transition active:scale-95 shadow-md"
          >
            Update
          </button>
        )}
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-3">
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Current</p>
          <p className="text-2xl font-black text-indigo-400 mt-0.5">{progress}%</p>
        </div>
        <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-3">
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Remaining</p>
          <p className="text-2xl font-black text-slate-350 mt-0.5">{remaining}%</p>
        </div>
      </div>

      {/* Animated Progress Bar */}
      <div className="space-y-2">
        <div className="h-3.5 bg-slate-950 border border-slate-850 rounded-full overflow-hidden p-0.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-400 h-full rounded-full"
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider px-1">
          <span>Started</span>
          <span>50%</span>
          <span>Done</span>
        </div>
      </div>

      {/* Additional Meta */}
      <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-850">
        <div>
          <span className="text-slate-500 font-semibold block uppercase tracking-wider mb-0.5">Estimation</span>
          <span className="text-slate-200 font-bold">{getEstimatedStatus()}</span>
        </div>
        <div>
          <span className="text-slate-500 font-semibold block uppercase tracking-wider mb-0.5">Last Updated</span>
          <span className="text-slate-205 font-bold font-mono">{lastUpdatedText}</span>
        </div>
      </div>

      {/* Progress updates history spark list */}
      {progressUpdates.length > 0 && (
        <div className="pt-4 border-t border-slate-850">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Recent Updates</h4>
          <div className="space-y-2 max-h-24 overflow-y-auto pr-1">
            {progressUpdates.slice(-3).reverse().map((update, idx) => (
              <div key={idx} className="flex justify-between items-center text-[11px] bg-slate-950/20 border border-slate-850/50 rounded-lg p-2">
                <span className="text-slate-350 truncate max-w-[180px]">
                  {update.message || "Progress updated"}
                </span>
                <span className="font-mono text-indigo-400 font-bold ml-2">
                  {update.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
