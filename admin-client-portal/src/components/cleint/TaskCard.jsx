import { useEffect, useState } from "react";
import { startTask } from "../../services/taskService";
import UploadModal from "./UploadModal";

function TaskCard({ task }) {
  const [showUpload, setShowUpload] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    // Live timer runs only while work is in progress
    if (!task.startedAt || task.status !== "in-progress") {
      return;
    }

    const updateTimer = () => {
      const startedTime = new Date(task.startedAt).getTime();
      const currentTime = Date.now();

      setElapsedSeconds(
        Math.max(0, Math.floor((currentTime - startedTime) / 1000))
      );
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [task.startedAt, task.status]);

  const formatTime = (seconds = 0) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  const handleStartTask = async () => {
    try {
      await startTask(task._id);
      window.location.reload();
    } catch (error) {
      console.error("Start task error:", error);
      alert(
        error.response?.data?.message || "Failed to start task"
      );
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
        <div>
          <h2 className="text-2xl font-bold text-white">{task.title}</h2>

          <p className="text-slate-400 mt-2">
            {task.description || "No description provided."}
          </p>
        </div>

        <span
          className={`w-fit px-4 py-2 rounded-full text-sm font-medium ${
            task.status === "pending"
              ? "bg-yellow-500/20 text-yellow-400"
              : task.status === "in-progress"
              ? "bg-blue-500/20 text-blue-400"
              : "bg-green-500/20 text-green-400"
          }`}
        >
          {task.status}
        </span>
      </div>

      {/* Details */}
      <div className="mt-5 space-y-2 text-sm">
        <p className="text-slate-300">
          Review Status:
          <span className="ml-2 text-white font-medium">
            {task.reviewStatus || "pending"}
          </span>
        </p>

        <p className="text-slate-300">
          Created:
          <span className="ml-2 text-white font-medium">
            {new Date(task.createdAt).toLocaleDateString()}
          </span>
        </p>

        {task.startedAt && (
          <p className="text-slate-300">
            Started:
            <span className="ml-2 text-white font-medium">
              {new Date(task.startedAt).toLocaleString()}
            </span>
          </p>
        )}

        {task.submittedAt && (
          <p className="text-slate-300">
            Submitted:
            <span className="ml-2 text-white font-medium">
              {new Date(task.submittedAt).toLocaleString()}
            </span>
          </p>
        )}
      </div>

      {/* Timer */}
      {task.status === "in-progress" && task.startedAt && (
        <div className="mt-5 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
          <p className="text-sm text-blue-300">Work timer running</p>
          <p className="mt-1 text-3xl font-bold tracking-wider text-white">
            ⏱ {formatTime(elapsedSeconds)}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            This timer continues even if you close the portal.
          </p>
        </div>
      )}

      {task.status === "completed" && task.totalTimeSpent > 0 && (
        <div className="mt-5 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
          <p className="text-sm text-green-300">Total time spent</p>
          <p className="mt-1 text-3xl font-bold tracking-wider text-white">
            ⏱ {formatTime(task.totalTimeSpent)}
          </p>
        </div>
      )}

      {/* Buttons */}
      <div className="mt-6 flex flex-wrap gap-3">
        {task.status === "pending" && (
          <button
            onClick={handleStartTask}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
          >
            Start Task
          </button>
        )}

        {task.status === "in-progress" && (
          <button
            onClick={() => setShowUpload(true)}
            className="rounded-lg bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
          >
            Upload Work
          </button>
        )}

        {task.status === "completed" && (
          <span className="rounded-lg bg-slate-700 px-4 py-2 text-white">
            Work Submitted
          </span>
        )}

        {task.reviewStatus === "approved" && (
          <span className="rounded-lg bg-green-500/20 px-4 py-2 text-green-400">
            ✅ Approved
          </span>
        )}

        {task.reviewStatus === "rejected" && (
          <button
            onClick={() => setShowUpload(true)}
            className="rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
          >
            Re-Submit Work
          </button>
        )}
      </div>

      {showUpload && (
        <UploadModal
          taskId={task._id}
          onClose={() => setShowUpload(false)}
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  );
}

export default TaskCard;