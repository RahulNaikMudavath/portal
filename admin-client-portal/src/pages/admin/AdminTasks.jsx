import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getTasks, reviewTask } from "../../services/taskService";

// Reuse engineer cards
import TaskHeader from "../../components/engineer/TaskHeader";
import CustomerCard from "../../components/engineer/CustomerCard";
import AIAnalysisCard from "../../components/engineer/AIAnalysisCard";
import ProgressCard from "../../components/engineer/ProgressCard";
import AttachmentsCard from "../../components/engineer/AttachmentsCard";
import NotesCard from "../../components/engineer/NotesCard";
import MaterialsCard from "../../components/engineer/MaterialsCard";
import PhotoGallery from "../../components/engineer/PhotoGallery";
import TimelineCard from "../../components/engineer/TimelineCard";
import SiteCard from "../../components/engineer/SiteCard";
import TravelCard from "../../components/engineer/TravelCard";
import TaskComments from "../../components/comments/TaskComments";

import { motion, AnimatePresence } from "framer-motion";

// Helper components inside AdminTasks
function AdminSignatureCard({ task }) {
  if (!task?.customerSignature) return null;
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition-all duration-300 hover:border-slate-700 hover:shadow-lg space-y-4">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <span>✍️</span> Customer Sign-Off Verification
      </h3>
      <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-4 text-xs text-slate-400 space-y-3">
        <div className="flex justify-between border-b border-slate-900 pb-2">
          <span>Signed By:</span>
          <span className="font-bold text-white">{task.customerSignName}</span>
        </div>
        <div className="flex justify-between border-b border-slate-900 pb-2">
          <span>Phone:</span>
          <span className="font-mono text-white">{task.customerSignPhone || "N/A"}</span>
        </div>
        <div className="flex justify-between border-b border-slate-900 pb-2">
          <span>Remarks:</span>
          <span className="italic text-slate-300">"{task.customerSignRemarks || "No comments"}"</span>
        </div>
        <div className="flex justify-between items-center border-b border-slate-900 pb-2">
          <span>Rating:</span>
          <div className="flex gap-0.5 text-yellow-450 text-sm">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i}>{i < task.customerSignRating ? "★" : "☆"}</span>
            ))}
          </div>
        </div>
        <div className="pt-2 flex justify-center">
          <div className="border border-slate-800 rounded-lg p-2 bg-slate-950 flex items-center justify-center max-w-[200px] w-full">
            <img
              src={task.customerSignature}
              alt="Customer Signature"
              className="max-h-[65px] object-contain invert brightness-200"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewActionsCard({ task, onReviewSubmitted }) {
  const [selectedAction, setSelectedAction] = useState(null); // approved, rejected, rework, return
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const reviewStatus = task?.reviewStatus || "pending";
  const isApproved = reviewStatus === "approved";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAction) return;

    if (selectedAction !== "approved" && !reason.trim()) {
      alert("Please provide a reason or remarks for this action.");
      return;
    }

    try {
      setLoading(true);
      const res = await reviewTask(task._id, selectedAction, reason.trim());
      alert(`Task review submitted: ${selectedAction.toUpperCase()}`);
      setSelectedAction(null);
      setReason("");
      if (onReviewSubmitted) onReviewSubmitted(res.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Review action failed");
    } finally {
      setLoading(false);
    }
  };

  if (isApproved) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-5 flex items-center gap-4 text-emerald-450">
        <span className="text-2xl">🔒</span>
        <div>
          <p className="text-sm font-bold text-white">Review Locked: Approved</p>
          <p className="text-xs text-slate-450 mt-0.5">This task has been verified and marked completed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
      <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
        Review Decision Panel
      </h3>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            setSelectedAction("approved");
            setReason("");
          }}
          className={`flex-1 min-w-[120px] text-xs font-bold uppercase tracking-wider py-2.5 px-3 rounded-xl border transition ${
            selectedAction === "approved"
              ? "bg-emerald-600 border-emerald-500 text-white"
              : "bg-slate-800 border-slate-700/60 text-slate-300 hover:bg-slate-750"
          }`}
        >
          ✅ Approve
        </button>

        <button
          onClick={() => setSelectedAction("rework")}
          className={`flex-1 min-w-[120px] text-xs font-bold uppercase tracking-wider py-2.5 px-3 rounded-xl border transition ${
            selectedAction === "rework"
              ? "bg-yellow-600 border-yellow-500 text-white"
              : "bg-slate-800 border-slate-700/60 text-slate-300 hover:bg-slate-750"
          }`}
        >
          🔄 Request Rework
        </button>

        <button
          onClick={() => setSelectedAction("return")}
          className={`flex-1 min-w-[120px] text-xs font-bold uppercase tracking-wider py-2.5 px-3 rounded-xl border transition ${
            selectedAction === "return"
              ? "bg-blue-600 border-blue-500 text-white"
              : "bg-slate-800 border-slate-700/60 text-slate-300 hover:bg-slate-750"
          }`}
        >
          💬 Return with Comments
        </button>

        <button
          onClick={() => setSelectedAction("rejected")}
          className={`flex-1 min-w-[120px] text-xs font-bold uppercase tracking-wider py-2.5 px-3 rounded-xl border transition ${
            selectedAction === "rejected"
              ? "bg-red-650 border-red-550 text-white"
              : "bg-slate-800 border-slate-700/60 text-slate-300 hover:bg-slate-750"
          }`}
        >
          ❌ Reject
        </button>
      </div>

      <AnimatePresence>
        {selectedAction && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="space-y-3 pt-2 border-t border-slate-800/80 overflow-hidden"
          >
            {selectedAction !== "approved" ? (
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">
                  Remarks / Revision instructions (Required)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Specify notes, fixes, or remarks for the engineer..."
                  rows={3}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                  required
                />
              </div>
            ) : (
              <p className="text-xs text-slate-450">
                Confirm approval of the submitted work attachments. This will lock the task.
              </p>
            )}

            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setSelectedAction(null);
                  setReason("");
                }}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-350 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white font-bold"
              >
                {loading ? "Submitting..." : "Confirm Action"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reviewFilter, setReviewFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const fetchTasks = async (updateSelected = false) => {
    try {
      const res = await getTasks();
      const sorted = [...res.data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setTasks(sorted);

      if (updateSelected && selectedTask) {
        const fresh = sorted.find((t) => t._id === selectedTask._id);
        if (fresh) setSelectedTask(fresh);
      }
    } catch (err) {
      console.error("Fetch tasks error:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(() => fetchTasks(true), 30000);
    return () => clearInterval(interval);
  }, [selectedTask?._id]);

  const filteredTasks = useMemo(() => {
    const normSearch = searchTerm.trim().toLowerCase();
    return tasks.filter((task) => {
      const title = (task.title || "").toLowerCase();
      const engineer = (task.assignedTo?.name || "").toLowerCase();
      const customer = (task.customerName || "").toLowerCase();

      const matchesSearch =
        !normSearch ||
        title.includes(normSearch) ||
        engineer.includes(normSearch) ||
        customer.includes(normSearch);

      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesReview = reviewFilter === "all" || (task.reviewStatus || "pending") === reviewFilter;
      const matchesCategory = categoryFilter === "all" || task.taskCategory === categoryFilter;

      return matchesSearch && matchesStatus && matchesReview && matchesCategory;
    });
  }, [tasks, searchTerm, statusFilter, reviewFilter, categoryFilter]);

  const handleReviewSubmitted = (updatedTask) => {
    fetchTasks(true);
  };

  return (
    <AdminLayout>
      {/* Workspace Header */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Review Center
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review completions, inspect site signatures, consume material logs, and assign rework.
          </p>
        </div>
        <span className="text-xs font-bold bg-slate-800 border border-slate-700/60 text-slate-300 px-3.5 py-2 rounded-xl">
          {filteredTasks.length} / {tasks.length} tasks
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side List (col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Search & Filters */}
          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-4 space-y-3">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search title, engineer or client..."
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500"
            />
            
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-850 rounded-lg p-2 text-slate-350 outline-none"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In progress</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={reviewFilter}
                onChange={(e) => setReviewFilter(e.target.value)}
                className="bg-slate-950 border border-slate-850 rounded-lg p-2 text-slate-350 outline-none"
              >
                <option value="all">All reviews</option>
                <option value="pending">Review pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-850 rounded-lg p-2 text-slate-350 outline-none col-span-2"
              >
                <option value="all">All categories</option>
                <option value="office">Office Tasks</option>
                <option value="field">Field Tasks</option>
              </select>
            </div>
          </div>

          {/* Vertical Task Row Cards */}
          <div className="space-y-3 max-h-[calc(100vh-21rem)] overflow-y-auto pr-1">
            {filteredTasks.map((task) => {
              const isActive = selectedTask?._id === task._id;
              const isField = task.taskCategory === "field";

              return (
                <div
                  key={task._id}
                  onClick={() => setSelectedTask(task)}
                  className={`relative cursor-pointer p-4 rounded-xl border transition duration-200 hover:border-indigo-500/50 ${
                    isActive
                      ? "bg-slate-800 border-indigo-500/60 shadow-lg"
                      : "bg-slate-900 border-slate-800 hover:bg-slate-850"
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r bg-indigo-500" />
                  )}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[9px] uppercase tracking-wider font-bold">
                      <span className={isField ? "text-emerald-450" : "text-indigo-400"}>
                        {isField ? "👷 Field" : "📄 Office"}
                      </span>
                      <span className={`px-2 py-0.5 rounded ${
                        task.reviewStatus === "approved"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : task.reviewStatus === "rejected"
                          ? "bg-red-500/10 text-red-405"
                          : "bg-yellow-500/10 text-yellow-450"
                      }`}>
                        {task.reviewStatus || "pending"}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white truncate">{task.title}</h4>
                    
                    <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-950/20">
                      <span>Eng: {task.assignedTo?.name || "Unassigned"}</span>
                      <span>Progress: {task.progress || 0}%</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredTasks.length === 0 && (
              <p className="text-xs text-slate-500 italic text-center py-8">
                No matching tasks found.
              </p>
            )}
          </div>
        </div>

        {/* Right Side Review Workspace (col-span-8) */}
        <div className="lg:col-span-8">
          {selectedTask ? (
            <div className="space-y-6">
              {/* Task Header metadata */}
              <TaskHeader task={selectedTask} />

              {/* Review Actions Panel */}
              <ReviewActionsCard
                task={selectedTask}
                onReviewSubmitted={handleReviewSubmitted}
              />

              {/* Core layouts based on Category */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
                {/* Left col details cards */}
                <div className="sm:col-span-7 space-y-6">
                  {selectedTask.taskCategory === "field" && (
                    <MaterialsCard task={selectedTask} onRefresh={() => fetchTasks(true)} />
                  )}
                  {selectedTask.taskCategory === "field" && (
                    <PhotoGallery task={selectedTask} onRefresh={() => fetchTasks(true)} />
                  )}
                  <NotesCard task={selectedTask} onRefresh={() => fetchTasks(true)} />
                  <AttachmentsCard task={selectedTask} />
                  <TaskComments taskId={selectedTask._id} />
                </div>

                {/* Right col metadata cards */}
                <div className="sm:col-span-5 space-y-6">
                  <ProgressCard task={selectedTask} />
                  {selectedTask.taskCategory === "field" && (
                    <>
                      <TravelCard task={selectedTask} onRefresh={() => fetchTasks(true)} />
                      <SiteCard task={selectedTask} />
                      <AdminSignatureCard task={selectedTask} />
                    </>
                  )}
                  <CustomerCard task={selectedTask} />
                  <TimelineCard task={selectedTask} />
                  <AIAnalysisCard task={selectedTask} />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center shadow-lg">
              <span className="text-5xl block mb-4">🔬</span>
              <h3 className="text-lg font-bold text-white">Review Panel Offline</h3>
              <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">
                Select a completed client task from the left list to review dynamic attachments, check-in histories, and allocate signatures.
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminTasks;