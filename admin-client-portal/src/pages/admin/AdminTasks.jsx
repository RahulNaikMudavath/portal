import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getTasks } from "../../services/taskService";

function AdminTasks() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const res = await getTasks();
      setTasks(res.data);
    };
    fetchTasks();
  }, []);

  return (
    <AdminLayout>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold">All Tasks</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">{tasks.length} total tasks</span>
      </div>

      <div className="grid gap-4">
        {tasks.length === 0 ? (
          <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border p-6 rounded-xl">
            No tasks available yet.
          </div>
        ) : (
          tasks.map((task) => (
            <TaskRow key={task._id} task={task} />
          ))
        )}
      </div>
    </AdminLayout>
  );
}

function TaskRow({ task }) {
  return (
    <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border p-5 rounded-xl shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-1">{task.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{task.description || "No description provided."}</p>
        </div>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 text-right">
          <p><span className="font-semibold">Status:</span> {task.status}</p>
          <p><span className="font-semibold">Review:</span> {task.reviewStatus}</p>
          <p><span className="font-semibold">Assigned:</span> {task.assignedTo?.name || "Unassigned"}</p>
        </div>
      </div>
    </div>
  );
}

export default AdminTasks;