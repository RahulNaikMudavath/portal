import { useState, useEffect } from "react";
import TaskList from "./TaskList";
import TaskDetails from "./TaskDetails";
import UpdateProgressModal from "./UpdateProgressModal";
import UploadModal from "./UploadModal";
import { getTasks, startTask, updateTaskProgress } from "../../services/taskService";

export default function TaskWorkspace() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);

  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isSubmittingProgress, setIsSubmittingProgress] = useState(false);

  // Load all tasks from API
  const loadTasks = async (keepSelection = false) => {
    try {
      const res = await getTasks();
      setTasks(res.data);

      if (res.data.length > 0) {
        if (keepSelection && selectedTask) {
          const updated = res.data.find((t) => t._id === selectedTask._id);
          setSelectedTask(updated || res.data[0]);
        } else {
          setSelectedTask(res.data[0]);
        }
      } else {
        setSelectedTask(null);
      }
    } catch (err) {
      console.error("Error loading tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleStartTask = async () => {
    if (!selectedTask) return;
    try {
      await startTask(selectedTask._id);
      await loadTasks(true);
    } catch (error) {
      console.error("Start task error:", error);
      alert(error.response?.data?.message || "Failed to start task");
    }
  };

  const handleProgressSubmit = async ({ percentage, message }) => {
    if (!selectedTask) return;
    setIsSubmittingProgress(true);
    try {
      await updateTaskProgress(selectedTask._id, { percentage, message });
      setShowProgressModal(false);
      await loadTasks(true);
    } catch (error) {
      console.error("Update progress error:", error);
      alert(error.response?.data?.message || "Failed to update task progress");
    } finally {
      setIsSubmittingProgress(false);
    }
  };

  const handleUploadSuccess = async () => {
    setShowUploadModal(false);
    await loadTasks(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
        <span className="ml-3 text-slate-400 font-medium">Loading tasks...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Task List Panel */}
        <div
          className={`lg:col-span-4 ${
            selectedTask ? "hidden lg:block" : "block"
          }`}
        >
          <TaskList
            tasks={tasks}
            selectedTaskId={selectedTask?._id}
            onSelectTask={(task) => setSelectedTask(task)}
          />
        </div>

        {/* Task Details Panel */}
        <div
          className={`lg:col-span-8 ${
            selectedTask ? "block" : "hidden lg:block"
          }`}
        >
          {selectedTask ? (
            <div className="space-y-4">
              {/* Mobile Back Button */}
              <button
                onClick={() => setSelectedTask(null)}
                className="lg:hidden flex items-center gap-2 bg-slate-900 border border-slate-800 text-slate-350 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl active:scale-95 transition"
              >
                ⬅️ Back to Task List
              </button>
              <TaskDetails
                task={selectedTask}
                onStartTask={handleStartTask}
                onProgressUpdate={() => setShowProgressModal(true)}
                onSubmitWork={() => setShowUploadModal(true)}
                onRefresh={() => loadTasks(true)}
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center shadow-lg">
              <div className="text-5xl mb-4">📋</div>
              <h2 className="text-xl font-bold text-white">Select a Task</h2>
              <p className="text-slate-400 mt-2 text-sm max-w-xs mx-auto">
                Click on any task card from the list to view its complete details and action logs.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Centrally Managed Modals */}
      {showProgressModal && (
        <UpdateProgressModal
          open={showProgressModal}
          onClose={() => setShowProgressModal(false)}
          onSubmit={handleProgressSubmit}
        />
      )}

      {showUploadModal && selectedTask && (
        <UploadModal
          taskId={selectedTask._id}
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}
