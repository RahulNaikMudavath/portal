import ClientLayout from "../../layouts/ClientLayout";
import TaskWorkspace from "../../components/engineer/TaskWorkspace";

export default function MyTasks() {
  return (
    <ClientLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">My Tasks</h1>
        <p className="text-slate-400 mt-2">View and manage your assigned work.</p>
      </div>

      <TaskWorkspace />
    </ClientLayout>
  );
}