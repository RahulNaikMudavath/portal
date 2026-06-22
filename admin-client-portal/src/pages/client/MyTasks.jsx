import { useEffect, useState } from "react";
import ClientLayout from "../../layouts/ClientLayout";
import TaskCard from "../../components/cleint/TaskCard";
import { getTasks } from "../../services/taskService";

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await getTasks();

      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <ClientLayout>

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-white">
          My Tasks
        </h1>

        <p className="text-slate-400 mt-2">
          View and manage your assigned work.
        </p>

      </div>
      

      {loading ? (
        <p className="text-white">
          Loading tasks...
        </p>
      ) : tasks.length === 0 ? (
        <div className="bg-slate-900 rounded-2xl p-8 text-center">

          <h3 className="text-white text-xl">
            No Tasks Assigned
          </h3>

          <p className="text-slate-400 mt-2">
            New work assigned by admin will appear here.
          </p>

        </div>
      ) : (
        <div className="grid gap-5">

          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
            />
          ))}

        </div>
      )}

    </ClientLayout>
  );
}