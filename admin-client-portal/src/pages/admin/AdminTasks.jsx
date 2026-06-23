import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getTasks, reviewTask } from "../../services/taskService";

function AdminTasks() {
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    try {
      const res = await getTasks();

      const sortedTasks = [...res.data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setTasks(sortedTasks);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <AdminLayout>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-3xl font-bold text-white">
          Task Review Center
        </h2>

        <span className="text-sm text-slate-400">
          {tasks.length} total tasks
        </span>
      </div>

      <div className="grid gap-5">
        {tasks.map((task) => (
          <TaskRow
            key={task._id}
            task={task}
            refreshTasks={fetchTasks}
          />
        ))}
      </div>
    </AdminLayout>
  );
}

function TaskRow({ task, refreshTasks }) {

  const handleApprove = async () => {
    try {
      await reviewTask(task._id, "approved");
      refreshTasks();
    } catch (error) {
      console.error(error);
      alert("Approval failed");
    }
  };

  const handleReject = async () => {
    try {
      await reviewTask(task._id, "rejected");
      refreshTasks();
    } catch (error) {
      console.error(error);
      alert("Rejection failed");
    }
  };

  const getFileLink = (url) => {
    if (url.endsWith(".pdf")) {
      return url.replace(
        "/upload/",
        "/upload/fl_attachment/"
      );
    }

    return url;
  };

  const isImage = (url) => {
    return (
      url.includes(".jpg") ||
      url.includes(".jpeg") ||
      url.includes(".png") ||
      url.includes(".webp")
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

      {/* Header */}

      <div className="flex justify-between items-start">

        <div>
          <h3 className="text-xl font-bold text-white">
            {task.title}
          </h3>

          <p className="text-slate-400 mt-2">
            {task.description}
          </p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-sm ${
            task.reviewStatus === "approved"
              ? "bg-green-500/20 text-green-400"
              : task.reviewStatus === "rejected"
              ? "bg-red-500/20 text-red-400"
              : "bg-yellow-500/20 text-yellow-400"
          }`}
        >
          {task.reviewStatus || "pending"}
        </span>

      </div>

      {/* Details */}

      <div className="mt-4 space-y-2">

        <p className="text-slate-400">
          Status:
          <span className="text-white ml-2">
            {task.status}
          </span>
        </p>

        <p className="text-slate-400">
          Assigned To:
          <span className="text-white ml-2">
            {task.assignedTo?.name || "Unassigned"}
          </span>
        </p>

      </div>

      {/* Submitted Files */}

      {task.submissionFiles?.length > 0 && (
        <div className="mt-5">

          <h4 className="text-white font-semibold mb-3">
            Submitted Files
          </h4>

          <div className="flex flex-col gap-3">

            {task.submissionFiles.map((file, index) => (
              <div key={index}>

                {isImage(file) ? (
                  <>
                    <img
                      src={file}
                      alt="submission"
                      className="
                        w-48
                        rounded-lg
                        border
                        border-slate-700
                        mb-2
                      "
                    />

                    <a
                      href={file}
                      target="_blank"
                      rel="noreferrer"
                      className="
                        text-green-400
                        hover:text-green-300
                        underline
                      "
                    >
                      View Image
                    </a>
                  </>
                ) : (
                  <a
                    href={getFileLink(file)}
                    target="_blank"
                    rel="noreferrer"
                    className="
                      text-blue-400
                      hover:text-blue-300
                      underline
                    "
                  >
                    Download PDF {index + 1}
                  </a>
                )}

              </div>
            ))}

          </div>

        </div>
      )}

      {/* Review Buttons */}

      {task.status === "completed" &&
        task.reviewStatus === "pending" && (
          <div className="flex gap-3 mt-5">

            <button
              onClick={handleApprove}
              className="
                bg-green-600
                hover:bg-green-700
                px-4
                py-2
                rounded-lg
                text-white
                transition
              "
            >
              Approve
            </button>

            <button
              onClick={handleReject}
              className="
                bg-red-600
                hover:bg-red-700
                px-4
                py-2
                rounded-lg
                text-white
                transition
              "
            >
              Reject
            </button>

          </div>
      )}

    </div>
  );
}

export default AdminTasks;