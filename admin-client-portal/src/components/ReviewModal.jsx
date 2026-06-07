import { useState } from "react";
import { reviewTask } from "../services/taskService";

function ReviewModal({ task, onClose, onReview }) {
  const [reviewStatus, setReviewStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReview = async () => {
    if (!reviewStatus) return;

    setIsSubmitting(true);
    try {
      await reviewTask(task._id, reviewStatus);
      onReview(task._id, reviewStatus);
      onClose();
    } catch (error) {
      console.error("Failed to review task:", error);
      alert("Failed to update review status. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFileName = (url) => {
    return url.split('/').pop();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Review Task</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{task.title}</h3>
            <p className="text-slate-600 dark:text-slate-400">{task.description || "No description provided."}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Assigned to:</span>
              <p className="text-slate-900 dark:text-white">{task.assignedTo?.name || "Unassigned"}</p>
            </div>
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Status:</span>
              <p className="text-slate-900 dark:text-white capitalize">{task.status}</p>
            </div>
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Submitted:</span>
              <p className="text-slate-900 dark:text-white">{new Date(task.updatedAt).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Review Status:</span>
              <p className="text-slate-900 dark:text-white capitalize">{task.reviewStatus}</p>
            </div>
          </div>

          {task.submissionFiles && task.submissionFiles.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Submitted Files</h4>
              <div className="space-y-2">
                {task.submissionFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-slate-900 dark:text-white font-medium">{getFileName(file)}</span>
                    </div>
                    <a
                      href={file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Review Decision</h4>
            <div className="space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={() => setReviewStatus("approved")}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                    reviewStatus === "approved"
                      ? "bg-green-600 text-white"
                      : "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800"
                  }`}
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => setReviewStatus("rejected")}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                    reviewStatus === "rejected"
                      ? "bg-red-600 text-white"
                      : "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                  }`}
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleReview}
            disabled={!reviewStatus || isSubmitting}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewModal;