import OfficeWorkspace from "./OfficeWorkspace";
import FieldWorkspace from "./FieldWorkspace";

export default function TaskDetails({
  task,
  onStartTask,
  onProgressUpdate,
  onSubmitWork,
  onRefresh,
}) {
  if (!task) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center shadow-lg">
        <div className="text-5xl mb-4">📋</div>
        <h2 className="text-xl font-bold text-white">Select a Task</h2>
        <p className="text-slate-400 mt-2 text-sm max-w-xs mx-auto">
          Click on any task card from the list to view its complete details and action logs.
        </p>
      </div>
    );
  }

  if (task.taskCategory === "office") {
    return (
      <OfficeWorkspace
        task={task}
        onStartTask={onStartTask}
        onProgressUpdate={onProgressUpdate}
        onSubmitWork={onSubmitWork}
        onRefresh={onRefresh}
      />
    );
  }

  return (
    <FieldWorkspace
      task={task}
      onStartTask={onStartTask}
      onProgressUpdate={onProgressUpdate}
      onSubmitWork={onSubmitWork}
      onRefresh={onRefresh}
    />
  );
}
