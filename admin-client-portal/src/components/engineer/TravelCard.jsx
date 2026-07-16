import { useState } from "react";
import { updateVisitStatus } from "../../services/taskService";
import { motion } from "framer-motion";

export default function TravelCard({ task, onRefresh }) {
  const [updating, setUpdating] = useState(false);

  const visitStatus = task?.visitStatus || "not-required";
  const taskStatus = task?.status || "pending";

  // Stages definitions
  const stages = [
    { key: "assigned", label: "Assigned", icon: "📋" },
    { key: "travelling", label: "Travelling", icon: "🚗" },
    { key: "reached-site", label: "Reached Site", icon: "📍" },
    { key: "inspection", label: "Inspection", icon: "🔍" },
    { key: "working", label: "Working", icon: "🔨" },
    { key: "submitted", label: "Submitted", icon: "🏁" }
  ];

  // Helper to determine active step index
  const getActiveIndex = () => {
    if (taskStatus === "completed" || taskStatus === "submitted") return 5;
    switch (visitStatus) {
      case "travelling":
        return 1;
      case "reached-site":
        return 2;
      case "inspection":
        return 3;
      case "working":
        return 4;
      default:
        return 0; // assigned
    }
  };

  const activeIndex = getActiveIndex();

  const handleStatusChange = async (nextStatus) => {
    try {
      setUpdating(true);
      await updateVisitStatus(task._id, nextStatus);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      alert("Failed to update travel status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition-all duration-300 hover:border-slate-700 hover:shadow-lg space-y-6">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <span>🚗</span> Dispatch & Site Check-in
      </h3>

      {/* Visual Stepper */}
      <div className="relative pt-2 pb-1.5">
        {/* Connection Bar */}
        <div className="absolute top-[38px] left-[15px] right-[15px] h-0.5 bg-slate-800 -translate-y-1/2 -z-0">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(activeIndex / (stages.length - 1)) * 100}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-indigo-500 shadow-[0_0_8px_#6366f1]"
          />
        </div>

        {/* Steps */}
        <div className="relative z-10 flex justify-between">
          {stages.map((stage, idx) => {
            const isCompleted = idx < activeIndex;
            const isActive = idx === activeIndex;

            return (
              <div key={stage.key} className="flex flex-col items-center space-y-2 group">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs border font-bold transition duration-300 ${
                    isCompleted
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : isActive
                      ? "bg-slate-900 border-indigo-500 text-indigo-400 ring-2 ring-indigo-500/20 shadow-[0_0_8px_#6366f1]"
                      : "bg-slate-950 border-slate-800 text-slate-500"
                  }`}
                  title={stage.label}
                >
                  {isCompleted ? "✓" : stage.icon}
                </div>
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider transition ${
                    isActive ? "text-indigo-400" : isCompleted ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Checkpoint actions */}
      {taskStatus === "in-progress" && (
        <div className="pt-2">
          {activeIndex === 0 && (
            <button
              disabled={updating}
              onClick={() => handleStatusChange("travelling")}
              className="w-full bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-bold uppercase tracking-wider py-3 rounded-xl transition active:scale-95 shadow-md shadow-indigo-950/40"
            >
              🚗 Dispatch Now (Set Travelling)
            </button>
          )}

          {activeIndex === 1 && (
            <button
              disabled={updating}
              onClick={() => handleStatusChange("reached-site")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider py-3 rounded-xl transition active:scale-95 shadow-md"
            >
              📍 Check In (Arrived at Site)
            </button>
          )}

          {activeIndex === 2 && (
            <button
              disabled={updating}
              onClick={() => handleStatusChange("inspection")}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-bold uppercase tracking-wider py-3 rounded-xl transition active:scale-95 shadow-md"
            >
              🔍 Start Initial Inspection
            </button>
          )}

          {activeIndex === 3 && (
            <button
              disabled={updating}
              onClick={() => handleStatusChange("working")}
              className="w-full bg-purple-650 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider py-3 rounded-xl transition active:scale-95 shadow-md"
            >
              🔨 Commence Site Actions / Work
            </button>
          )}

          {activeIndex === 4 && (
            <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-3 text-center text-xs text-indigo-400 font-semibold">
              🔨 Work Commenced. Submit work in Action Bar when done!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
