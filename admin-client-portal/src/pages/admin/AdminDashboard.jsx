import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getTasks } from "../../services/taskService";
import { getClients } from "../../services/userService";
import API from "../../services/api";
import ReviewModal from "../../components/ReviewModal";

function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [clientsLoading, setClientsLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await API.get("/api/tasks/stats");
      setStats(res.data);
    };

    const fetchTasks = async () => {
      const res = await getTasks();
      setTasks(res.data);
    };

    const fetchClients = async () => {
      setClientsLoading(true);
      const res = await getClients();
      setClients(res.data);
      setClientsLoading(false);
    };

    fetchStats();
    fetchTasks();
    fetchClients();
  }, []);

  const handleSearch = async () => {
    setClientsLoading(true);
    const res = await getClients(searchTerm.trim());
    setClients(res.data);
    setClientsLoading(false);
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
    setTasks(tasks.map(task =>
      task._id === taskId
        ? { ...task, reviewStatus: status }
        : task
    ));
  };

  const activeTasks = tasks.filter(task => task.status !== "completed");
  const completedTasks = tasks.filter(task => task.status === "completed");

  return (
    <>
      <AdminLayout>
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card title="Total" value={stats.total} />
          <Card title="Pending" value={stats.pending} />
          <Card title="In Progress" value={stats.inProgress} />
          <Card title="Completed" value={stats.completed} />
        </div>

        <section className="mb-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold">Client Directory</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Search clients by name or unique client ID.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search name or client ID"
                className="w-full sm:w-80 px-4 py-3 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleSearch}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all duration-200"
              >
                Search
              </button>
            </div>
          </div>

          {clientsLoading ? (
            <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border p-6 rounded-xl text-center text-gray-500 dark:text-gray-400">
              Loading clients…
            </div>
          ) : clients.length === 0 ? (
            <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border p-6 rounded-xl text-center text-gray-500 dark:text-gray-400">
              No clients found.
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {clients.slice(0, 8).map((client) => (
                <ClientCard key={client._id} client={client} />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Active Tasks</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">Tasks in progress</span>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 mb-8">
            {activeTasks.length === 0 ? (
              <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border p-6 rounded-xl">
                No active tasks.
              </div>
            ) : (
              activeTasks.slice(0, 6).map((task) => (
                <TaskCard key={task._id} task={task} onView={handleViewTask} />
              ))
            )}
          </div>

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Task History</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">Completed and reviewed tasks</span>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {completedTasks.length === 0 ? (
              <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border p-6 rounded-xl">
                No completed tasks yet.
              </div>
            ) : (
              completedTasks.slice(0, 6).map((task) => (
                <TaskCard key={task._id} task={task} onView={handleViewTask} />
              ))
            )}
          </div>
        </section>
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

function ClientCard({ client }) {
  return (
    <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-light-text dark:text-dark-text">{client.name}</h4>
          <p className="text-sm text-indigo-600 dark:text-indigo-300 font-mono font-bold">ID: {client.rollNumber || "N/A"}</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 rounded-full">{client.role}</span>
      </div>

      <div className="border-t border-light-border dark:border-dark-border pt-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase">Email</p>
            <p className="text-light-text dark:text-dark-text truncate">{client.email}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase">Phone</p>
            <p className="text-light-text dark:text-dark-text">{client.phone || "—"}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase">Company</p>
            <p className="text-light-text dark:text-dark-text">{client.company || "—"}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase">City</p>
            <p className="text-light-text dark:text-dark-text">{client.city || "—"}</p>
          </div>
          {client.address && (
            <div className="sm:col-span-2">
              <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase">Address</p>
              <p className="text-light-text dark:text-dark-text text-xs">{client.address}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <p>Joined: {new Date(client.createdAt).toLocaleDateString()}</p>
        <button className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200">
          View
        </button>
      </div>
    </div>
  );
}

function TaskCard({ task, onView }) {
  return (
    <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-semibold text-light-text dark:text-dark-text">{task.title}</h4>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
            task.status === "pending" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
            task.status === "in-progress" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          }`}>
            {task.status}
          </span>
          {task.reviewStatus && (
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
              task.reviewStatus === "approved" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200" :
              task.reviewStatus === "rejected" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" :
              "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
            }`}>
              {task.reviewStatus}
            </span>
          )}
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{task.description || "No description provided."}</p>
      <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
        <p><span className="font-semibold">Assigned to:</span> {task.assignedTo?.name || "Unassigned"}</p>
        <p><span className="font-semibold">Review:</span> {task.reviewStatus || "pending"}</p>
        <p><span className="font-semibold">Created:</span> {new Date(task.createdAt).toLocaleDateString()}</p>
      </div>
      {task.status === "completed" && (
        <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border">
          <button
            onClick={() => onView(task)}
            className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors duration-200"
          >
            View & Review
          </button>
        </div>
      )}
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border p-5 rounded-xl shadow">
      <h3 className="text-gray-500 dark:text-gray-400">{title}</h3>
      <p className="text-2xl font-bold text-light-text dark:text-dark-text">{value || 0}</p>
    </div>
  );
}

export default AdminDashboard;