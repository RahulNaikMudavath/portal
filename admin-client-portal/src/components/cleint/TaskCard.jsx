import { startTask } from "../../services/taskService";
import UploadModal from "./UploadModal";
import { useState } from "react";

function TaskCard({ task }) {

  const [showUpload, setShowUpload] = useState(false);
  const handleStartTask = async () => {
    try {
      await startTask(task._id);

      alert("Task started successfully");

      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Failed to start task");
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-lg">

      {/* Header */}
      <div className="flex justify-between items-start mb-4">

        <div>
          <h2 className="text-2xl font-bold text-white">
            {task.title}
          </h2>

          <p className="text-slate-400 mt-2">
            {task.description}
          </p>
        </div>

        <span
          className={`
            px-4 py-2 rounded-full text-sm font-medium
            ${
              task.status === "pending"
                ? "bg-yellow-500/20 text-yellow-400"
                : task.status === "in-progress"
                ? "bg-blue-500/20 text-blue-400"
                : "bg-green-500/20 text-green-400"
            }
          `}
        >
          {task.status}
        </span>

      </div>

      {/* Details */}
      <div className="space-y-2">

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

        {/* DEBUG */}
        <p className="text-cyan-400">
          DEBUG STATUS: [{task.status}]
        </p>

      </div>

      {/* Buttons */}
      <div className="mt-6 flex flex-wrap gap-3">

        {task.status === "pending" && (
          <button
            onClick={handleStartTask}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white"
          >
            Start Task
          </button>
        )}

        {task.status === "in-progress" && (
  <button
    onClick={() => setShowUpload(true)}
    className="
      bg-green-600
      hover:bg-green-700
      text-white
      px-4
      py-2
      rounded-lg
    "
  >
    Upload Work
  </button>
)}

        {task.status === "completed" && (
          <button
            className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-white"
          >
            View Submission
          </button>
        )}

        {task.reviewStatus === "approved" && (
          <span className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg">
            ✅ Approved
          </span>
        )}

        {task.reviewStatus === "rejected" && (
          <button
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white"
          >
            Re-Submit Work
          </button>
        )}
        {showUpload && (
        <UploadModal
        taskId={task._id}
        onClose={() => setShowUpload(false)}
        onSuccess={() => window.location.reload()}/>
)}

      </div>

    </div>
  );
}

export default TaskCard;