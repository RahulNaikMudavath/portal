import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTasks, startTask, submitTask } from "../../services/taskService";
import { ThemeToggle } from "../../components/ThemeToggle";
import NotificationBell from "../../components/NotificationBell";

function ClientDashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState({ name: "Client", email: "", role: "client" });
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      const res = await getTasks();
      setTasks(res.data);
    };

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user info", error);
      }
    }

    fetchTasks();
  }, []);

  const handleTaskSubmit = async (taskId, formData) => {
    try {
      await submitTask(taskId, formData);
      // Refresh tasks after submission
      const res = await getTasks();
      setTasks(res.data);
      alert("Work submitted successfully!");
    } catch (error) {
      console.error("Failed to submit task:", error);
      alert("Failed to submit work. Please try again.");
    }
  };

  const handleTaskStart = async (taskId) => {
    try {
      await startTask(taskId);
      // Refresh tasks after starting
      const res = await getTasks();
      setTasks(res.data);
    } catch (error) {
      console.error("Failed to start task:", error);
      alert("Failed to start task. Please try again.");
    }
  };

  const pendingCount = tasks.filter((task) => task.status === "pending").length;
  const inProgressCount = tasks.filter((task) => task.status === "in-progress").length;
  const completedCount = tasks.filter((task) => task.status === "completed").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-sm shadow-slate-200/50 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-slate-900/40">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">Client Portal</p>
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">Modern work management for clients</h1>
                </div>
                <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800 dark:bg-blue-900/80 dark:text-blue-200">
                  Welcome back
                </span>
              </div>

              <nav className="flex flex-wrap gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                <a href="#home" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 hover:border-blue-400 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-blue-500 dark:hover:text-blue-300">Home</a>
                <a href="#about" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 hover:border-blue-400 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-blue-500 dark:hover:text-blue-300">About Us</a>
                <a href="#services" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 hover:border-blue-400 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-blue-500 dark:hover:text-blue-300">Services</a>
              </nav>
            </div>

            <div className="flex flex-wrap items-center gap-3 justify-between sm:justify-end">
              <NotificationBell />
              <ThemeToggle />
              <div className="relative">
                <button
                  onClick={() => setShowProfile((prev) => !prev)}
                  className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                    {user.name?.[0]?.toUpperCase() || "C"}
                  </span>
                  <span>{user.name || "Client"}</span>
                </button>

                {showProfile && (
                  <div className="absolute right-0 z-20 mt-2 w-52 rounded-3xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-950">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Account</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{user.email || "No email available"}</p>
                    <div className="mt-3 space-y-2">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full rounded-full bg-red-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <section id="home" className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">Dashboard overview</p>
                <h2 className="mt-3 text-4xl font-semibold text-slate-900 dark:text-white">Hello, {user.name || "Client"}</h2>
                <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  Review your active tasks, submit work, and stay connected with your admin support resources in one clean workspace.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Pending" value={pendingCount} accent="yellow" />
                <StatCard label="In Progress" value={inProgressCount} accent="blue" />
                <StatCard label="Completed" value={completedCount} accent="green" />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Your Tasks</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Everything you need to complete your assignments at a glance.
                </p>
              </div>
              <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {tasks.length} total tasks
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {tasks.map((task) => (
                <TaskCard key={task._id} task={task} onSubmit={(formData) => handleTaskSubmit(task._id, formData)} onStart={() => handleTaskStart(task._id)} />
              ))}
            </div>
          </div>
          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 mb-4">Quick profile</p>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-600 text-xl font-semibold text-white">
                  {user.name?.[0]?.toUpperCase() || "C"}
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{user.name || "Client User"}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{user.email || "No email available"}</p>
                </div>
              </div>
              <div className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <div>
                  <p className="font-semibold">Role</p>
                  <p>{user.role || "Client"}</p>
                </div>
              </div>
            </div>

            <div id="about" className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 mb-4">About Us</p>
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                Welcome to your client portal where task management, progress tracking, and support are organized for a smooth experience.
              </p>
            </div>

            <div id="services" className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 mb-4">Services</p>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <li className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950">Task assignment and progress updates</li>
                <li className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950">Secure file submission</li>
                <li className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950">Client support and review status</li>
              </ul>
            </div>
          </aside>
        </section>

        <section id="contact" className="mt-8 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Need help?</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Contact your admin or use the support links to get help with your tasks and portal access.</p>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  const accentColors = {
    yellow: "text-yellow-800 bg-yellow-100",
    blue: "text-blue-800 bg-blue-100",
    green: "text-green-800 bg-green-100",
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
      <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-4 text-4xl font-semibold ${accentColors[accent]}`}>{value}</p>
    </div>
  );
}

function TaskCard({ task, onStart, onSubmit }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("files", selectedFile);
      await onSubmit(formData);
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById(`file-${task._id}`);
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Failed to submit task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition duration-300 hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white break-words">{task.title}</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{task.description || "No description yet."}</p>
        </div>
        <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${
          task.status === "pending" ? "bg-yellow-100 text-yellow-800" :
          task.status === "in-progress" ? "bg-blue-100 text-blue-800" :
          "bg-green-100 text-green-800"
        }`}>
          {task.status}
        </span>
      </div>
      <div className="mt-5 space-y-4 text-sm text-slate-600 dark:text-slate-300">
        <p><span className="font-semibold">Assigned by:</span> {task.assignedTo?.name || "Unassigned"}</p>
        <p><span className="font-semibold">Review status:</span> {task.reviewStatus || "pending"}</p>
      </div>
      <div className="mt-5 space-y-3">
        {task.status === "pending" && (
          <button onClick={onStart} className="w-full rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
            Start Task
          </button>
        )}
        {task.status === "in-progress" && (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Upload work</label>
            <input
              id={`file-${task._id}`}
              type="file"
              className="w-full rounded-2xl border border-slate-300 bg-white p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              onChange={handleFileChange}
            />
            {selectedFile && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Selected: {selectedFile.name}
              </p>
            )}
            <button
              onClick={handleSubmit}
              disabled={!selectedFile || isSubmitting}
              className="w-full rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit Work"}
            </button>
          </div>
        )}
        {task.status === "completed" && (
          <div className="rounded-2xl bg-green-50 p-3 dark:bg-green-950">
            <p className="text-sm font-semibold text-green-800 dark:text-green-200">
              ✅ Work submitted successfully
            </p>
            <p className="text-xs text-green-600 dark:text-green-300 mt-1">
              Waiting for admin review
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClientDashboard;
