import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getTasks, reviewTask } from "../../services/taskService";

const getPriorityStyle = (priority) => {
  if (priority === "high") {
    return "border border-red-500/30 bg-red-500/20 text-red-400";
  }

  if (priority === "low") {
    return "border border-green-500/30 bg-green-500/20 text-green-400";
  }

  return "border border-yellow-500/30 bg-yellow-500/20 text-yellow-400";
};

const isOverdue = (task, currentTime = Date.now()) => {
  return (
    task.deadline &&
    new Date(task.deadline).getTime() < currentTime &&
    task.status !== "completed"
  );
};

const formatDateTime = (date) => {
  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const fetchTasks = async () => {
    try {
      const res = await getTasks();

      const sortedTasks = [...res.data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setTasks(sortedTasks);
    } catch (err) {
      console.error("Fetch tasks error:", err);
    }
  };
  useEffect(() => {
  const clockInterval = setInterval(() => {
    setCurrentTime(Date.now());
  }, 1000);

  return () => clearInterval(clockInterval);
}, []);

  useEffect(() => {
    fetchTasks();

    const interval = setInterval(fetchTasks, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">
            Task Review Center
          </h2>

          <p className="mt-1 text-slate-400">
            Track assignments, priorities, deadlines, submissions, and work time.
          </p>
        </div>

        <span className="text-sm text-slate-400">
          {tasks.length} total tasks
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <h3 className="text-lg font-semibold text-white">No tasks yet</h3>

          <p className="mt-2 text-slate-400">
            Tasks created for clients will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
          {tasks.map((task) => (
            <TaskRow
  key={task._id}
  task={task}
  refreshTasks={fetchTasks}
  currentTime={currentTime}
/>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

function TaskRow({ task, refreshTasks, currentTime })  {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

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

  const handleApprove = async () => {
    try {
      await reviewTask(task._id, "approved");
      refreshTasks();
    } catch (error) {
      console.error(error);
      alert("Approval failed");
    }
  };

  const handleReject = async () => {
    try {
      await reviewTask(task._id, "rejected");
      refreshTasks();
    } catch (error) {
      console.error(error);
      alert("Rejection failed");
    }
  };

  const reviewStyle =
    task.reviewStatus === "approved"
      ? "bg-green-500/20 text-green-400"
      : task.reviewStatus === "rejected"
      ? "bg-red-500/20 text-red-400"
      : "bg-yellow-500/20 text-yellow-400";

  const statusStyle =
    task.status === "pending"
      ? "bg-yellow-500/20 text-yellow-400"
      : task.status === "in-progress"
      ? "bg-blue-500/20 text-blue-400"
      : "bg-green-500/20 text-green-400";

const overdue = isOverdue(task, currentTime);
  const priority = task.priority || "medium";

  return (
    <div
      className={`rounded-2xl border bg-slate-900 p-5 ${
        overdue ? "border-red-500/50" : "border-slate-800"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">{task.title}</h3>

          <p className="mt-2 text-slate-400">
            {task.description || "No description provided."}
          </p>

          {/* Priority + deadline */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${getPriorityStyle(
                priority
              )}`}
            >
              {priority.toUpperCase()} PRIORITY
            </span>

            {task.deadline && (
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  overdue
                    ? "border-red-500/30 bg-red-500/20 text-red-400"
                    : "border-blue-500/30 bg-blue-500/20 text-blue-400"
                }`}
              >
                {overdue
                  ? `⚠ OVERDUE · Due ${formatDateTime(task.deadline)}`
                  : `Due ${formatDateTime(task.deadline)}`}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full px-3 py-1 text-sm ${statusStyle}`}>
            {task.status}
          </span>

          <span className={`rounded-full px-3 py-1 text-sm ${reviewStyle}`}>
            Review: {task.reviewStatus || "pending"}
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
        <p className="text-slate-400">
          Assigned To:
          <span className="ml-2 font-medium text-white">
            {task.assignedTo?.name || "Unassigned"}
          </span>
        </p>

        <p className="text-slate-400">
          Created:
          <span className="ml-2 font-medium text-white">
            {new Date(task.createdAt).toLocaleDateString("en-IN")}
          </span>
        </p>

        {task.deadline && (
          <p className="text-slate-400">
            Deadline:
            <span
              className={`ml-2 font-medium ${
                overdue ? "text-red-400" : "text-white"
              }`}
            >
              {formatDateTime(task.deadline)}
            </span>
          </p>
        )}

        {task.startedAt && (
          <p className="text-slate-400">
            Started:
            <span className="ml-2 font-medium text-white">
              {formatDateTime(task.startedAt)}
            </span>
          </p>
        )}

        {task.submittedAt && (
          <p className="text-slate-400">
            Submitted:
            <span className="ml-2 font-medium text-white">
              {formatDateTime(task.submittedAt)}
            </span>
          </p>
        )}
      </div>

      {task.status === "in-progress" && task.startedAt && (
        <div className="mt-5 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
          <p className="text-sm text-blue-300">
            Client is currently working
          </p>

          <p className="mt-1 text-3xl font-bold tracking-wider text-white">
            ⏱ {formatTime(elapsedSeconds)}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Timer started when {task.assignedTo?.name || "the client"} clicked
            Start Task.
          </p>
        </div>
      )}

      {task.status === "completed" && task.totalTimeSpent > 0 && (
        <div className="mt-5 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
          <p className="text-sm text-green-300">Final work duration</p>

          <p className="mt-1 text-3xl font-bold tracking-wider text-white">
            ⏱ {formatTime(task.totalTimeSpent)}
          </p>
        </div>
      )}

      {task.submissionFiles?.length > 0 && (
        <div className="mt-5">
          <h4 className="mb-2 font-semibold text-white">Submitted Files</h4>

          <div className="flex flex-col gap-2">
            {task.submissionFiles.map((file, index) => (
              <a
                key={index}
                href={file}
                target="_blank"
                rel="noreferrer"
                className="w-fit text-blue-400 underline transition hover:text-blue-300"
              >
                View File {index + 1}
              </a>
            ))}
          </div>
        </div>
      )}

      {task.status === "completed" && task.reviewStatus === "pending" && (
        <div className="mt-5 flex gap-3">
          <button
            onClick={handleApprove}
            className="rounded-lg bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
          >
            Approve
          </button>

          <button
            onClick={handleReject}
            className="rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminTasks;