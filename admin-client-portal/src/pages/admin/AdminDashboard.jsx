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

              {/* Engineer Directory */}
              <section>
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-light-text dark:text-dark-text">
                        👨‍💻 Engineers & Field Team Directory
                      </h3>
                      <span className="rounded-full bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {clients.length} Engineers
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      View all registered engineers, field technicians, and active team members.
                    </p>
                  </div>

                  <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
                    <input
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      placeholder="Search engineer name, phone or ID..."
                      className="w-full rounded-2xl border border-light-border bg-light-card px-4 py-3 text-sm text-light-text outline-none focus:ring-2 focus:ring-indigo-500 dark:border-dark-border dark:bg-dark-card dark:text-dark-text sm:w-80 shadow-xs"
                    />

                    <button
                      onClick={handleSearch}
                      className="rounded-2xl bg-indigo-600 px-6 py-3 font-bold text-xs uppercase tracking-wider text-white transition hover:bg-indigo-700 shadow-md cursor-pointer"
                    >
                      Search
                    </button>
                  </div>
                </div>

                {clientsLoading ? (
                  <EmptyBox text="Loading engineers..." />
                ) : clients.length === 0 ? (
                  <EmptyBox text="No registered engineers found." />
                ) : (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {clients.map((client) => (
                      <ClientCard key={client._id} client={client} />
                    ))}
                  </div>
                )}
              </section>

              {/* Active Tasks */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-extrabold text-light-text dark:text-dark-text flex items-center gap-2">
                      <span>⚡ Active Tasks & On-Site Deployments</span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Tasks currently assigned to field engineers or in progress.
                    </p>
                  </div>
                  <span className="rounded-full bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {activeTasks.length} Active
                  </span>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  {activeTasks.length === 0 ? (
                    <EmptyBox text="No active tasks currently assigned." />
                  ) : (
                    activeTasks.map((task) => (
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
              <section className="space-y-4 pt-4 border-t border-light-border/60 dark:border-dark-border/60">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-extrabold text-light-text dark:text-dark-text flex items-center gap-2">
                      <span>✅ Evaluated Task History</span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Completed assignments, star ratings, and approved submissions.
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {completedTasks.length} Completed
                  </span>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  {completedTasks.length === 0 ? (
                    <EmptyBox text="No completed tasks yet." />
                  ) : (
                    completedTasks.map((task) => (
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
      <h3 className="text-xl font-bold text-light-text dark:text-dark-text">
        {title}
      </h3>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
        {subtitle}
      </p>
    </div>
  );
}

function EmptyBox({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-light-border bg-light-card/50 p-8 text-center text-xs font-bold text-gray-400 dark:border-dark-border dark:bg-dark-card/50">
      {text}
    </div>
  );
}

function ClientCard({ client }) {
  return (
    <div className="rounded-2xl border border-light-border bg-light-card p-5 shadow-sm transition hover:shadow-md dark:border-dark-border dark:bg-dark-card space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={client.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=4f46e5&color=fff`}
            alt={client.name}
            className="h-12 w-12 rounded-full object-cover shadow-sm border border-indigo-500/20"
          />
          <div>
            <h4 className="text-base font-bold text-light-text dark:text-dark-text">
              {client.name}
            </h4>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {client.email}
            </p>

            <p className="mt-1 font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
              ID: {client.rollNumber || client._id?.slice(-8)}
            </p>
          </div>
        </div>

        <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-300 capitalize">
          {client.role === "client" ? "Engineer" : (client.role || "Engineer")}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-light-border/60 pt-4 text-xs dark:border-dark-border/60">
        <div>
          <p className="text-gray-400 uppercase text-[9px] font-bold tracking-wider">Phone</p>
          <p className="mt-0.5 font-bold text-light-text dark:text-dark-text">
            {client.phone || "Not added"}
          </p>
        </div>

        <div>
          <p className="text-gray-400 uppercase text-[9px] font-bold tracking-wider">Location / City</p>
          <p className="mt-0.5 font-bold text-light-text dark:text-dark-text">
            {client.city || "Not added"}
          </p>
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task, onView }) {
  const isCompleted = task.status === "completed";

  const priorityColors = {
    urgent: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
    high: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    medium: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
    low: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  };

  return (
    <div className="rounded-3xl border border-light-border bg-light-card p-6 shadow-sm transition hover:shadow-lg dark:border-dark-border dark:bg-dark-card space-y-4 flex flex-col justify-between">
      <div className="space-y-3">
        
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border tracking-wider ${priorityColors[task.priority || "medium"]}`}>
              {task.priority || "medium"} priority
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 capitalize">
              {task.taskCategory || "General"}
            </span>
          </div>

          <StatusBadge status={task.status} />
        </div>

        {/* Task Title & Description */}
        <div>
          <h4 className="text-base font-black text-light-text dark:text-dark-text tracking-tight line-clamp-1">
            {task.title}
          </h4>

          <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            {task.description || "No specific instructions added for this assignment."}
          </p>
        </div>

      </div>

      {/* Engineer & Review Information */}
      <div className="grid grid-cols-2 gap-3 border-t border-light-border/60 dark:border-dark-border/60 pt-4 text-xs">
        <div>
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Assigned Engineer</p>
          <div className="mt-1 flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
              {task.assignedTo?.name?.charAt(0) || "E"}
            </div>
            <p className="font-bold text-light-text dark:text-dark-text truncate">
              {task.assignedTo?.name || "Unassigned"}
            </p>
          </div>
        </div>

        <div>
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Admin Rating / Review</p>
          {task.adminRating ? (
            <div className="mt-1 flex items-center gap-1 text-amber-400 text-xs font-extrabold">
              <span>{"★".repeat(task.adminRating)}</span>
              <span className="text-light-text dark:text-dark-text ml-1">({task.adminRating}/5)</span>
            </div>
          ) : (
            <p className="mt-1 font-semibold capitalize text-light-text dark:text-dark-text">
              {task.reviewStatus || "Pending Review"}
            </p>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between border-t border-light-border/60 dark:border-dark-border/60 pt-4">
        <p className="text-[11px] font-medium text-gray-400">
          {isCompleted && task.submittedAt
            ? `Completed: ${new Date(task.submittedAt).toLocaleDateString()}`
            : task.deadline
            ? `Deadline: ${new Date(task.deadline).toLocaleDateString()}`
            : `Created: ${new Date(task.createdAt).toLocaleDateString()}`}
        </p>

        <button
          onClick={() => onView(task)}
          className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-md hover:shadow-indigo-500/20 active:scale-97 cursor-pointer"
        >
          {isCompleted ? "Evaluate & Review" : "View Details"}
        </button>
      </div>

    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30",
    "in-progress": "bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30",
    completed: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
  };

  return (
    <span
      className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
        styles[status] || "bg-gray-500/15 text-gray-600 dark:text-gray-300"
      }`}
    >
      {status || "pending"}
    </span>
  );
}

export default AdminDashboard;