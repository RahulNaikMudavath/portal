import { useState, useEffect } from "react";
import { reviewTask } from "../services/taskService";

function ReviewModal({ task, onClose, onReview }) {
  const [reviewStatus, setReviewStatus] = useState("approved");
  const [rating, setRating] = useState(5);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleReview = async () => {
    if (!reviewStatus) return;

    setIsSubmitting(true);
    try {
      await reviewTask(task._id, reviewStatus, rating, reason);
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
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-opacity cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl cursor-default"
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Review Task Submission</h2>
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
              <span className="font-semibold text-slate-700 dark:text-slate-300">Assigned Engineer:</span>
              <p className="text-slate-900 dark:text-white font-bold">{task.assignedTo?.name || "Unassigned"}</p>
            </div>
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Status:</span>
              <p className="text-slate-900 dark:text-white capitalize">{task.status}</p>
            </div>
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Submitted On:</span>
              <p className="text-slate-900 dark:text-white">{new Date(task.updatedAt).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Current Review Status:</span>
              <p className="text-slate-900 dark:text-white capitalize">{task.reviewStatus}</p>
            </div>
          </div>

          {task.submissionFiles && task.submissionFiles.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Submitted Files & Proofs</h4>
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

          {/* Decision Buttons */}
          <div>
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Review Decision</h4>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setReviewStatus("approved")}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all cursor-pointer ${
                  reviewStatus === "approved"
                    ? "bg-emerald-600 text-white shadow-lg"
                    : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                }`}
              >
                ✅ Approve Task
              </button>
              <button
                type="button"
                onClick={() => setReviewStatus("rejected")}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all cursor-pointer ${
                  reviewStatus === "rejected"
                    ? "bg-rose-600 text-white shadow-lg"
                    : "bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300"
                }`}
              >
                ❌ Reject Task
              </button>
            </div>
          </div>

          {/* Admin Star Rating Selector */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Admin Performance Rating</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Rate the engineer's work quality (1 to 5 stars). This will update their overall growth score & rank.
            </p>
            <div className="flex items-center gap-2 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-3xl transition-transform hover:scale-125 cursor-pointer ${
                    star <= rating ? "text-amber-400 drop-shadow" : "text-slate-300 dark:text-slate-600"
                  }`}
                >
                  ★
                </button>
              ))}
              <span className="ml-3 text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                {rating} / 5 Stars
              </span>
            </div>
          </div>

          {/* Feedback Note */}
          <div>
            <label className="block text-sm font-bold text-slate-900 dark:text-white mb-1">
              Review Remarks / Feedback Notes
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={reviewStatus === "rejected" ? "Specify rejection reason..." : "Enter optional performance remarks..."}
              rows={3}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleReview}
            disabled={!reviewStatus || isSubmitting}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors cursor-pointer shadow-lg"
          >
            {isSubmitting ? "Submitting..." : "Submit Decision & Rating"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewModal;