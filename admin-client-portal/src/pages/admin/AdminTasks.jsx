import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getTasks, reviewTask } from "../../services/taskService";
import TaskComments from "../../components/comments/TaskComments";

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

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reviewFilter, setReviewFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

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

  // Updates overdue status automatically every second
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(clockInterval);
  }, []);

  // Fetches backend changes automatically every 30 seconds
  useEffect(() => {
    fetchTasks();

    const interval = setInterval(fetchTasks, 30000);

    return () => clearInterval(interval);
  }, []);

  const filteredTasks = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const priorityRank = {
      high: 1,
      medium: 2,
      low: 3,
    };

    return [...tasks]
      .filter((task) => {
        const taskTitle = (task.title || "").toLowerCase();
        const clientName = (task.assignedTo?.name || "").toLowerCase();

        const matchesSearch =
          !normalizedSearch ||
          taskTitle.includes(normalizedSearch) ||
          clientName.includes(normalizedSearch);

        const matchesStatus =
          statusFilter === "all" || task.status === statusFilter;

        const matchesReview =
          reviewFilter === "all" ||
          (task.reviewStatus || "pending") === reviewFilter;

        const matchesPriority =
          priorityFilter === "all" ||
          (task.priority || "medium") === priorityFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesReview &&
          matchesPriority
        );
      })
      .sort((a, b) => {
        if (sortBy === "deadline") {
          const aDeadline = a.deadline
            ? new Date(a.deadline).getTime()
            : Number.MAX_SAFE_INTEGER;

          const bDeadline = b.deadline
            ? new Date(b.deadline).getTime()
            : Number.MAX_SAFE_INTEGER;

          return aDeadline - bDeadline;
        }

        if (sortBy === "priority") {
          return (
            priorityRank[a.priority || "medium"] -
            priorityRank[b.priority || "medium"]
          );
        }

        if (sortBy === "oldest") {
          return new Date(a.createdAt) - new Date(b.createdAt);
        }

        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [
    tasks,
    searchTerm,
    statusFilter,
    reviewFilter,
    priorityFilter,
    sortBy,
  ]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setReviewFilter("all");
    setPriorityFilter("all");
    setSortBy("newest");
  };

  return (
    <AdminLayout>
      {/* Page heading */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">
            Task Review Center
          </h2>

          <p className="mt-1 text-slate-400">
            Track assignments, priorities, deadlines, submissions, and work time.
          </p>
        </div>

        <span className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-300">
          {filteredTasks.length} of {tasks.length} tasks
        </span>
      </div>

      {/* Search, filter and sorting panel */}
      <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search task or client..."
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-indigo-500"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In progress</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={reviewFilter}
            onChange={(event) => setReviewFilter(event.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
          >
            <option value="all">All reviews</option>
            <option value="pending">Review pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
          >
            <option value="all">All priorities</option>
            <option value="high">High priority</option>
            <option value="medium">Medium priority</option>
            <option value="low">Low priority</option>
          </select>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="deadline">Deadline closest</option>
            <option value="priority">High priority first</option>
          </select>
        </div>

        <button
          onClick={clearFilters}
          className="mt-3 text-sm font-semibold text-indigo-400 transition hover:text-indigo-300"
        >
          Clear all filters
        </button>
      </div>

      {/* Task content */}
      {tasks.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <h3 className="text-lg font-semibold text-white">No tasks yet</h3>

          <p className="mt-2 text-slate-400">
            Tasks created for clients will appear here.
          </p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <h3 className="text-lg font-semibold text-white">
            No matching tasks
          </h3>

          <p className="mt-2 text-slate-400">
            Try changing or clearing your filters.
          </p>

          <button
            onClick={clearFilters}
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid gap-5">
          {filteredTasks.map((task) => (
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

function TaskRow({ task, refreshTasks, currentTime }) {
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
          <h4 className="mb-2 font-semibold text-white">
            Submitted Files
          </h4>

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

      <TaskComments taskId={task._id} />

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