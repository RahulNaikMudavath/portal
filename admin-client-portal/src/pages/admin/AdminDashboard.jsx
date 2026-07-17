import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getTasks } from "../../services/taskService";
import API from "../../services/api";
import ReviewModal from "../../components/ReviewModal";
import SmartAiDashboard from "../../components/dashboard/SmartAiDashboard";
import AiAnalyticsView from "../../components/analytics/AiAnalyticsView";
import AttentionCenter from "../../components/dashboard/AttentionCenter";
import { getClients } from "../../services/userService";
import socket from "../../socket";

function AdminDashboard() {
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [clientsLoading, setClientsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchDashboardData = async () => {
    try {
      const [tasksRes, clientsRes] = await Promise.all([
        getTasks(),
        getClients(),
      ]);

      setTasks(tasksRes.data);
      setClients(clientsRes.data);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setClientsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    socket.on("taskDashboardUpdate", () => {
      fetchDashboardData();
    });

    const interval = setInterval(fetchDashboardData, 30000);

    return () => {
      clearInterval(interval);
      socket.off("taskDashboardUpdate");
    };
  }, []);

  const handleSearch = async () => {
    try {
      setClientsLoading(true);

      const res = await getClients(searchTerm.trim());

      setClients(res.data);
    } catch (error) {
      console.error("Client search error:", error);
    } finally {
      setClientsLoading(false);
    }
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleViewTask = (task) => {
    setSelectedTask(task);
    setShowReviewModal(true);
  };

  const handleReviewTask = (taskId, status) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task._id === taskId ? { ...task, reviewStatus: status } : task
      )
    );

    fetchDashboardData();
  };

  const activeTasks = tasks.filter((task) => task.status !== "completed");

  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  );

  const recentActivities = [...tasks]
    .sort((a, b) => {
      const firstDate = new Date(
        a.submittedAt || a.startedAt || a.updatedAt || a.createdAt
      );

      const secondDate = new Date(
        b.submittedAt || b.startedAt || b.updatedAt || b.createdAt
      );

      return secondDate - firstDate;
    })
    .slice(0, 8)
    .map((task) => {
      let title = `Created and assigned task: ${task.title}`;
      let icon = "➕";
      let date = task.createdAt;

      if (task.reviewStatus === "approved") {
        title = `Approved task: ${task.title}`;
        icon = "✅";
        date = task.updatedAt || task.submittedAt || task.createdAt;
      } else if (task.reviewStatus === "rejected") {
        title = `Rejected task: ${task.title}`;
        icon = "↩️";
        date = task.updatedAt || task.submittedAt || task.createdAt;
      } else if (task.status === "completed") {
        title = `Submitted task: ${task.title}`;
        icon = "📤";
        date = task.submittedAt || task.updatedAt || task.createdAt;
      } else if (task.status === "in-progress") {
        title = `Started task: ${task.title}`;
        icon = "▶️";
        date = task.startedAt || task.updatedAt || task.createdAt;
      }

      return {
        id: task._id,
        title,
        icon,
        date,
        clientName: task.assignedTo?.name || "Unassigned client",
      };
    });

  return (
    <>
      <AdminLayout>
        <div className="space-y-8">
          {/* Header & Tab Selector */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-light-border dark:border-dark-border pb-4">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-light-text dark:text-dark-text">
                Control Center Dashboard
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Track live work logs, monitor workloads, and evaluate AI predictions.
              </p>
            </div>
            <div className="flex rounded-xl bg-gray-105 dark:bg-slate-800 p-1 self-start sm:self-auto shadow-xs border border-light-border dark:border-dark-border">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
                  activeTab === "overview"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-gray-650 dark:text-gray-400 hover:text-light-text dark:hover:text-white"
                }`}
              >
                Workspace Overview
              </button>
              <button
                onClick={() => setActiveTab("ai")}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                  activeTab === "ai"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-gray-650 dark:text-gray-400 hover:text-light-text dark:hover:text-white"
                }`}
              >
                ✨ AI Predictor Suite
              </button>
            </div>
          </div>

          {activeTab === "overview" ? (
            <div className="space-y-10">
              {/* Main Analytics */}
              <SmartAiDashboard tasks={tasks} onApproveTask={handleViewTask} />
              <AttentionCenter tasks={tasks} onOpenTask={handleViewTask} />

              {/* Dashboard heading */}
              <div>
                <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">
                  Workspace Management
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Manage clients, track work, and review submissions.
                </p>
              </div>

              {/* Collapsible Recent Activity */}
              <section className="rounded-2xl border border-light-border bg-light-card shadow-sm dark:border-dark-border dark:bg-dark-card">
                <button
                  onClick={() => setShowActivity((current) => !current)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <div>
                    <h3 className="text-xl font-semibold text-light-text dark:text-dark-text">
                      Recent Activity
                    </h3>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Latest updates across tasks, submissions, and reviews.
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span className="hidden text-xs text-gray-500 dark:text-gray-400 sm:block">
                      Auto refreshes every 30 sec
                    </span>

                    <span className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">
                      {showActivity ? "Hide ▲" : "Show ▼"}
                    </span>
                  </div>
                </button>

                {showActivity && (
                  <div className="border-t border-light-border px-5 pb-5 pt-4 dark:border-dark-border">
                    {recentActivities.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No recent activity yet.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {recentActivities.map((activity) => (
                          <div
                            key={activity.id}
                            className="flex items-start gap-4 rounded-xl border border-light-border bg-light-bg p-4 dark:border-dark-border dark:bg-dark-bg"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-lg">
                              {activity.icon}
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold text-light-text dark:text-dark-text">
                                {activity.title}
                              </p>

                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Client: {activity.clientName}
                              </p>

                              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                {new Date(activity.date).toLocaleString("en-IN")}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* Client Directory */}
              <section>
                <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-light-text dark:text-dark-text">
                      Client Directory
                    </h3>

                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Search clients by name or unique client ID.
                    </p>
                  </div>

                  <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
                    <input
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      placeholder="Search name or client ID"
                      className="w-full rounded-xl border border-light-border bg-light-card px-4 py-3 text-light-text outline-none focus:ring-2 focus:ring-indigo-500 dark:border-dark-border dark:bg-dark-card dark:text-dark-text sm:w-80"
                    />

                    <button
                      onClick={handleSearch}
                      className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
                    >
                      Search
                    </button>
                  </div>
                </div>

                {clientsLoading ? (
                  <EmptyBox text="Loading clients..." />
                ) : clients.length === 0 ? (
                  <EmptyBox text="No clients found." />
                ) : (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {clients.slice(0, 8).map((client) => (
                      <ClientCard key={client._id} client={client} />
                    ))}
                  </div>
                )}
              </section>

              {/* Active Tasks */}
              <section>
                <SectionHeader
                  title="Active Tasks"
                  subtitle="Tasks that are pending or currently in progress."
                />

                <div className="grid gap-4 lg:grid-cols-2">
                  {activeTasks.length === 0 ? (
                    <EmptyBox text="No active tasks." />
                  ) : (
                    activeTasks.slice(0, 6).map((task) => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        onView={handleViewTask}
                      />
                    ))
                  )}
                </div>
              </section>

              {/* Completed Tasks */}
              <section>
                <SectionHeader
                  title="Task History"
                  subtitle="Completed tasks and reviewed submissions."
                />

                <div className="grid gap-4 lg:grid-cols-2">
                  {completedTasks.length === 0 ? (
                    <EmptyBox text="No completed tasks yet." />
                  ) : (
                    completedTasks.slice(0, 6).map((task) => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        onView={handleViewTask}
                      />
                    ))
                  )}
                </div>
              </section>
            </div>
          ) : (
            <AiAnalyticsView />
          )}
        </div>
      </AdminLayout>

      {showReviewModal && selectedTask && (
        <ReviewModal
          task={selectedTask}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedTask(null);
          }}
          onReview={handleReviewTask}
        />
      )}
    </>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-4">
      <h3 className="text-xl font-semibold text-light-text dark:text-dark-text">
        {title}
      </h3>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        {subtitle}
      </p>
    </div>
  );
}

function EmptyBox({ text }) {
  return (
    <div className="rounded-xl border border-light-border bg-light-card p-6 text-gray-500 dark:border-dark-border dark:bg-dark-card dark:text-gray-400">
      {text}
    </div>
  );
}

function ClientCard({ client }) {
  return (
    <div className="rounded-2xl border border-light-border bg-light-card p-5 shadow-sm transition hover:shadow-md dark:border-dark-border dark:bg-dark-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-lg font-semibold text-light-text dark:text-dark-text">
            {client.name}
          </h4>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {client.email}
          </p>

          <p className="mt-2 font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-300">
            ID: {client.rollNumber || client._id}
          </p>
        </div>

        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
          {client.role || "client"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-light-border pt-4 text-sm dark:border-dark-border">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Phone</p>
          <p className="mt-1 font-medium text-light-text dark:text-dark-text">
            {client.phone || "Not added"}
          </p>
        </div>

        <div>
          <p className="text-gray-500 dark:text-gray-400">City</p>
          <p className="mt-1 font-medium text-light-text dark:text-dark-text">
            {client.city || "Not added"}
          </p>
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task, onView }) {
  const isCompleted = task.status === "completed";

  return (
    <div className="rounded-2xl border border-light-border bg-light-card p-5 shadow-sm dark:border-dark-border dark:bg-dark-card">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h4 className="truncate text-lg font-semibold text-light-text dark:text-dark-text">
            {task.title}
          </h4>

          <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
            {task.description || "No description added."}
          </p>
        </div>

        <StatusBadge status={task.status} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Assigned to</p>
          <p className="mt-1 font-semibold text-light-text dark:text-dark-text">
            {task.assignedTo?.name || "Unassigned"}
          </p>
        </div>

        <div>
          <p className="text-gray-500 dark:text-gray-400">Review</p>
          <p className="mt-1 font-semibold capitalize text-light-text dark:text-dark-text">
            {task.reviewStatus || "pending"}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-light-border pt-4 dark:border-dark-border">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {isCompleted && task.submittedAt
            ? `Submitted: ${new Date(task.submittedAt).toLocaleDateString()}`
            : `Created: ${new Date(task.createdAt).toLocaleDateString()}`}
        </p>

        <button
          onClick={() => onView(task)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          View
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-300",
    "in-progress": "bg-blue-500/15 text-blue-600 dark:text-blue-300",
    completed: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  };

  return (
    <span
      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] || "bg-gray-500/15 text-gray-600 dark:text-gray-300"
      }`}
    >
      {status || "pending"}
    </span>
  );
}

export default AdminDashboard;