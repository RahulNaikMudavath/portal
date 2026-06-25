import { useEffect, useRef, useState } from "react";import {
  addTaskComment,
  getTaskComments,
} from "../../services/commentService";
import socket from "../../socket";

function TaskComments({ taskId }) {
  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [open, setOpen] = useState(false);
  const commentsEndRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchComments = async () => {
    try {
      setLoading(true);

      const response = await getTaskComments(taskId);
      setComments(response.data);
    } catch (error) {
      console.error("Fetch comments error:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
  if (open && comments.length > 0) {
    commentsEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }
}, [comments, open]);

  useEffect(() => {
    if (open) {
      fetchComments();
    }
  }, [open, taskId]);

  useEffect(() => {
    const handleNewTaskComment = (data) => {
      if (data.taskId !== taskId) return;

      setComments((currentComments) => {
        const alreadyExists = currentComments.some(
          (comment) => comment._id === data.comment._id
        );

        if (alreadyExists) return currentComments;

        return [...currentComments, data.comment];
      });
    };

    socket.on("new_task_comment", handleNewTaskComment);
    

    return () => {
      socket.off("new_task_comment", handleNewTaskComment);
    };
  }, [taskId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!message.trim()) return;

    try {
      setSending(true);

      const response = await addTaskComment(taskId, message.trim());

      setComments((currentComments) => {
        const alreadyExists = currentComments.some(
          (comment) => comment._id === response.data._id
        );

        if (alreadyExists) return currentComments;

        return [...currentComments, response.data];
      });

      setMessage("");
    } catch (error) {
      console.error("Add comment error:", error);
      alert(error.response?.data?.message || "Failed to send comment");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-5 rounded-xl border border-slate-700 bg-slate-950/40">
      <button
        onClick={() => setOpen((currentOpen) => !currentOpen)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="font-semibold text-white">💬 Task Discussion</span>

        <span className="text-sm text-slate-400">
          {open ? "Hide" : "Open"}
        </span>
      </button>

      {open && (
        <div className="border-t border-slate-700 p-4">
          {loading ? (
            <p className="text-sm text-slate-400">Loading discussion...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-slate-400">
              No comments yet. Start the discussion.
            </p>
          ) : (
            <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
              {comments.map((comment) => {
                const senderId = comment.sender?._id || comment.sender?.id;

                const isMyComment =
                  String(senderId) === String(user._id || user.id);

                return (
                  <div
                    key={comment._id}
                    className={`rounded-xl p-3 ${
                      isMyComment
                        ? "ml-6 bg-indigo-600/20"
                        : "mr-6 bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-white">
                        {comment.sender?.name || "User"}
                        <span className="ml-2 text-xs font-normal text-slate-400">
                          {comment.sender?.role || ""}
                        </span>
                      </p>

                      <span className="text-xs text-slate-500">
                        {new Date(comment.createdAt).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <p className="mt-2 break-words text-sm text-slate-200">
                      {comment.message}
                    </p>
                  </div>
                );
              })}
              <div ref={commentsEndRef} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Write a comment..."
              className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-500"
            />

            <button
              type="submit"
              disabled={sending || !message.trim()}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default TaskComments;