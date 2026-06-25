import { useEffect, useState } from "react";
import { startTask } from "../../services/taskService";
import UploadModal from "./UploadModal";

const getDeadlineInfo = (deadline, currentTime) => {
  if (!deadline) return null;

  const difference = new Date(deadline).getTime() - currentTime;

  if (difference <= 0) {
    return {
      overdue: true,
      label: "⚠ OVERDUE",
    };
  }

  const totalSeconds = Math.floor(difference / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    overdue: false,
    label: `⏳ ${days}d ${String(hours).padStart(2, "0")}h ${String(
      minutes
    ).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s left`,
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
  if (priority === "high") {
    return "bg-red-500/20 text-red-400";
  }

  if (priority === "low") {
    return "bg-green-500/20 text-green-400";
  }

  return "bg-yellow-500/20 text-yellow-400";
};

const getStatusStyle = (status) => {
  if (status === "in-progress") {
    return "bg-blue-500/20 text-blue-400";
  }

  if (status === "completed") {
    return "bg-green-500/20 text-green-400";
  }

  return "bg-yellow-500/20 text-yellow-400";
};

function TaskCard({ task }) {
  const [showUpload, setShowUpload] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Updates deadline countdown and overdue status automatically.
  useEffect(() => {
    const deadlineInterval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(deadlineInterval);
  }, []);

  // Updates persistent work timer while client is working.
  useEffect(() => {
    if (!task.startedAt || task.status !== "in-progress") {
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
  }, [task.startedAt, task.status]);

  const handleStartTask = async () => {
    try {
      await startTask(task._id);
      window.location.reload();
    } catch (error) {
      console.error("Start task error:", error);
      alert(error.response?.data?.message || "Failed to start task");
    }
  };

  const priority = task.priority || "medium";
  const deadlineInfo = getDeadlineInfo(task.deadline, currentTime);

  const deadlineStyle = deadlineInfo?.overdue
    ? "bg-red-500/20 text-red-400"
    : "bg-blue-500/20 text-blue-400";

  return (
    <div
      className={`rounded-2xl border bg-slate-900 p-6 shadow-lg ${
        deadlineInfo?.overdue && task.status !== "completed"
          ? "border-red-500/50"
          : "border-slate-700"
      }`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{task.title}</h2>

          <p className="mt-2 text-slate-400">
            {task.description || "No description provided."}
          </p>
        </div>

        <span
          className={`w-fit rounded-full px-4 py-2 text-sm font-medium ${getStatusStyle(
            task.status
          )}`}
        >
          {task.status}
        </span>
      </div>

      {/* Priority + Deadline */}
      <div className="mt-4 flex flex-wrap gap-3">
        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold ${getPriorityStyle(
            priority
          )}`}
        >
          Priority: {priority.toUpperCase()}
        </span>

        {task.deadline && deadlineInfo && (
          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${deadlineStyle}`}
          >
            {deadlineInfo.overdue
              ? deadlineInfo.label
              : `${deadlineInfo.label} · Due ${new Date(
                  task.deadline
                ).toLocaleString("en-IN")}`}
          </span>
        )}
      </div>

      {/* Details */}
      <div className="mt-5 space-y-2 text-sm">
        <p className="text-slate-300">
          Review Status:
          <span className="ml-2 font-medium text-white">
            {task.reviewStatus || "pending"}
          </span>
        </p>

        <p className="text-slate-300">
          Created:
          <span className="ml-2 font-medium text-white">
            {new Date(task.createdAt).toLocaleDateString("en-IN")}
          </span>
        </p>

        {task.startedAt && (
          <p className="text-slate-300">
            Started:
            <span className="ml-2 font-medium text-white">
              {new Date(task.startedAt).toLocaleString("en-IN")}
            </span>
          </p>
        )}

        {task.submittedAt && (
          <p className="text-slate-300">
            Submitted:
            <span className="ml-2 font-medium text-white">
              {new Date(task.submittedAt).toLocaleString("en-IN")}
            </span>
          </p>
        )}
      </div>

      {/* Persistent timer */}
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

      {/* Final duration */}
      {task.status === "completed" && task.totalTimeSpent > 0 && (
        <div className="mt-5 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
          <p className="text-sm text-green-300">Total time spent</p>

          <p className="mt-1 text-3xl font-bold tracking-wider text-white">
            ⏱ {formatTime(task.totalTimeSpent)}
          </p>
        </div>
      )}

      {/* Actions */}
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