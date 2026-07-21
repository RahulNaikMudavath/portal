import { useState } from "react";
import { updateVisitStatus } from "../../services/taskService";
import { motion } from "framer-motion";
import { isAppOnline, queueOfflineAction } from "../../utils/offlineSync";

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
      
      let locationCoords = null;
      if (nextStatus === "reached-site" || nextStatus === "working" || nextStatus === "inspection") {
        try {
          const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { 
              enableHighAccuracy: true,
              timeout: 6000 
            });
          });
          locationCoords = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;
          console.log("GPS Location captured:", locationCoords);
        } catch (gpsError) {
          console.warn("GPS tracking failed or denied:", gpsError);
        }
      }

      if (!isAppOnline()) {
        queueOfflineAction("updateVisitStatus", task._id, { visitStatus: nextStatus, locationCoords });
        alert("Field Mode Offline: Action queued locally!");
        if (onRefresh) onRefresh();
      } else {
        await updateVisitStatus(task._id, nextStatus, locationCoords);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition-all duration-300 hover:border-slate-700 hover:shadow-lg space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>🚗</span> Dispatch & Site Check-in
        </h3>
        {task?.locationCoords && (
          <span className="text-[10px] bg-indigo-500/15 border border-indigo-500/25 px-2 py-0.5 rounded-full text-indigo-400 font-mono">
            📍 GPS CAPTURED
          </span>
        )}
      </div>

      {/* Live Site Address & GPS Target */}
      <div className="bg-slate-955 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Site Destination</p>
            <p className="text-sm font-bold text-white mt-0.5">
              {task?.siteAddress || task?.locationCoords || "Field Site Address"}
            </p>
            {task?.customerName && (
              <p className="text-xs text-slate-400 mt-0.5">Customer: {task.customerName}</p>
            )}
          </div>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(task?.locationCoords || task?.siteAddress || "Site Location")}&travelmode=driving`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>🗺️ Live Maps Navigation</span>
          </a>
        </div>

        {task?.locationCoords && (
          <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-xs text-slate-350">
            <span>GPS Coordinates:</span>
            <span className="font-mono text-indigo-400 font-bold">{task.locationCoords}</span>
          </div>
        )}
      </div>

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
