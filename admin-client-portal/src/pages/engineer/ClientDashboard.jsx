import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ClientLayout from "../../layouts/ClientLayout";
import { getTasks } from "../../services/taskService";
import { getGreeting } from "../../utils/timeUtils";
import socket from "../../socket";
import { getIcsFeedUrl, getWebcalFeedUrl } from "../../services/calendarService";

function ClientDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(0);

  const fetchTasks = async () => {
    try {
      const res = await getTasks();

      const sortedTasks = [...res.data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setTasks(sortedTasks);
    } catch (error) {
      console.error("Could not load engineer dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      await fetchTasks();
      setNow(Date.now());
    };

    loadDashboard();

    socket.on("calendarUpdate", fetchTasks);
    socket.on("taskDashboardUpdate", fetchTasks);
    socket.on("newNotification", fetchTasks);

    const taskRefresh = setInterval(fetchTasks, 30000);
    const timerRefresh = setInterval(() => setNow(Date.now()), 1000);

    return () => {
      socket.off("calendarUpdate", fetchTasks);
      socket.off("taskDashboardUpdate", fetchTasks);
      socket.off("newNotification", fetchTasks);
      clearInterval(taskRefresh);
      clearInterval(timerRefresh);
    };
  }, []);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const pendingTasks = useMemo(
    () => tasks.filter((task) => task.status === "pending"),
    [tasks]
  );

  const inProgressTasks = useMemo(
    () => tasks.filter((task) => task.status === "in-progress"),
    [tasks]
  );

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.status === "completed"),
    [tasks]
  );

  const activeTask = inProgressTasks[0];

  return (
    <ClientLayout>
      <div className="mx-auto max-w-7xl pb-10">
        {/* Welcome */}
        <section className="mb-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 transition-colors duration-300">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-xs font-extrabold uppercase tracking-[0.35em] text-indigo-600 dark:text-indigo-400">
              👨‍💻 Engineer Control Workspace
            </p>
            <a
              href={getWebcalFeedUrl()}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 text-xs font-bold transition inline-flex items-center gap-1.5"
            >
              <span>📱 Sync Schedule to iPhone/Calendar</span>
            </a>
          </div>

          <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white md:text-4xl">
                {getGreeting()}, {user.name || "Engineer"} 👋
              </h1>

              <p className="mt-3 max-w-2xl text-slate-500 dark:text-slate-400">
                Track assigned site visits, start active work timers, submit audio notes & proof photos, and receive real-time admin schedule updates.
              </p>
            </div>

            <Link
              to="/client/tasks"
              className="inline-flex w-fit items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 cursor-pointer shadow-xs"
            >
              View My Tasks →
            </Link>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            title="Pending"
            value={pendingTasks.length}
            icon="📌"
            tone="yellow"
          />

          <StatCard
            title="In Progress"
            value={inProgressTasks.length}
            icon="⏱️"
            tone="blue"
          />

          <StatCard
            title="Completed"
            value={completedTasks.length}
            icon="✅"
            tone="green"
          />
        </section>

        {/* Main active task */}
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-850 dark:text-white">
                Current Work
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Your active task and persistent work timer.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm text-slate-655 dark:text-slate-300">
              {tasks.length} total tasks
            </span>
          </div>

          {loading ? (
            <EmptyState text="Loading your workspace..." />
          ) : activeTask ? (
            <ActiveTaskCard task={activeTask} now={now} />
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 text-center transition-colors">
              <div className="text-4xl">🚀</div>

              <h3 className="mt-4 text-xl font-bold text-slate-800 dark:text-white">
                No task is currently running
              </h3>

              <p className="mx-auto mt-2 max-w-lg text-slate-500 dark:text-slate-400">
                Start one of your pending tasks to activate the work timer.
              </p>

              <Link
                to="/client/tasks"
                className="mt-5 inline-flex rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 cursor-pointer"
              >
                Go to My Tasks
              </Link>
            </div>
          )}
        </section>

        {/* Pending + Recent work */}
        <section className="grid gap-8 xl:grid-cols-2">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-850 dark:text-white">
                  Pending Tasks
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Tasks waiting for you to begin.
                </p>
              </div>

              <Link
                to="/client/tasks"
                className="text-sm font-semibold text-indigo-600 dark:text-indigo-300 hover:underline"
              >
                See all →
              </Link>
            </div>

            <div className="space-y-4">
              {pendingTasks.length === 0 ? (
                <EmptyState text="No pending tasks right now." />
              ) : (
                pendingTasks.slice(0, 3).map((task) => (
                  <SmallTaskCard key={task._id} task={task} />
                ))
              )}
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-850 dark:text-white">
                  Recently Completed
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Your latest submitted work.
                </p>
              </div>

              <Link
                to="/client/submissions"
                className="text-sm font-semibold text-indigo-600 dark:text-indigo-300 hover:underline"
              >
                View submissions →
              </Link>
            </div>

            <div className="space-y-4">
              {completedTasks.length === 0 ? (
                <EmptyState text="No completed tasks yet." />
              ) : (
                completedTasks.slice(0, 3).map((task) => (
                  <SmallTaskCard key={task._id} task={task} completed />
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </ClientLayout>
  );
}

function ActiveTaskCard({ task, now }) {
  const seconds = task.startedAt
    ? Math.max(
        0,
        Math.floor((now - new Date(task.startedAt).getTime()) / 1000)
      )
    : 0;

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-indigo-500/30 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-indigo-950/40 transition-colors">
      <div className="p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full bg-blue-500/10 dark:bg-blue-500/20 px-3 py-1 text-sm font-semibold text-blue-600 dark:text-blue-300">
                ● In Progress
              </span>

              <span className="rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 px-3 py-1 text-sm font-semibold text-indigo-600 dark:text-indigo-200">
                Persistent Timer Active
              </span>
            </div>

            <h3 className="mt-4 text-2xl font-bold text-slate-800 dark:text-white md:text-3xl">
              {task.title}
            </h3>

            <p className="mt-3 text-slate-600 dark:text-slate-300">
              {task.description || "No task description provided."}
            </p>

            <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
              Started:{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {task.startedAt
                  ? new Date(task.startedAt).toLocaleString()
                  : "Not available"}
              </span>
            </p>

            <div className="mt-5 flex items-center gap-3 flex-wrap">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(task.locationCoords || task.siteAddress || task.title)}&travelmode=driving`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-md hover:shadow-indigo-500/20 active:scale-97 cursor-pointer"
              >
                <span>🗺️ Open Live Google Maps Route</span>
              </a>
              {(task.siteAddress || task.locationCoords) && (
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-xs">
                  Target: {task.siteAddress || task.locationCoords}
                </span>
              )}
            </div>
          </div>

          <div className="min-w-[260px] rounded-2xl border border-emerald-200 dark:border-emerald-400/25 bg-emerald-50/50 dark:bg-emerald-500/10 p-5">
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">
              LIVE WORK TIME
            </p>

            <p className="mt-2 font-mono text-4xl font-bold tracking-wider text-slate-800 dark:text-white">
              {formatTime(seconds)}
            </p>

            <p className="mt-2 text-sm text-emerald-700/80 dark:text-emerald-100/70">
              Timer stops automatically when you submit.
            </p>

            <Link
              to="/client/tasks"
              className="mt-5 flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700"
            >
              Upload Work
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function SmallTaskCard({ task, completed = false }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 transition hover:border-slate-350 dark:hover:border-slate-700">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold text-slate-800 dark:text-white">
            {task.title}
          </h3>

          <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
            {task.description || "No description provided."}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
            completed
              ? "bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
              : "bg-yellow-500/10 dark:bg-yellow-500/15 text-yellow-600 dark:text-yellow-300"
          }`}
        >
          {completed ? task.reviewStatus || "completed" : "pending"}
        </span>
      </div>

      <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-4 text-sm text-slate-500 dark:text-slate-400">
        Assigned by:{" "}
        <span className="font-semibold text-slate-700 dark:text-slate-200">
          {task.createdBy?.name || "Admin"}
        </span>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, tone }) {
  const tones = {
    yellow: "border-yellow-200 dark:border-yellow-500/25 bg-yellow-50/50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
    blue: "border-blue-200 dark:border-blue-500/25 bg-blue-50/50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300",
    green: "border-emerald-200 dark:border-emerald-500/25 bg-emerald-50/50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  };

  return (
    <div className={`rounded-2xl border p-5 transition-colors ${tones[tone]}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold uppercase tracking-[0.2em]">
          {title}
        </p>

        <span className="text-2xl">{icon}</span>
      </div>

      <p className="mt-4 text-4xl font-bold text-slate-800 dark:text-white">{value}</p>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-2xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-slate-500 dark:text-slate-400 transition-colors">
      {text}
    </div>
  );
}

function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
}

export default ClientDashboard;