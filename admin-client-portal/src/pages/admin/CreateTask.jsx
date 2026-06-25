import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getClients } from "../../services/userService";
import { createTask } from "../../services/taskService";

function CreateTask() {
  const [clients, setClients] = useState([]);
  const [file, setFile] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [loading, setLoading] = useState(false);

  const initialForm = {
    title: "",
    description: "",
    assignedTo: "",
    priority: "medium",
    deadline: "",
  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await getClients();
        setClients(res.data);
      } catch (error) {
        console.error("Could not load clients:", error);
      }
    };

    fetchClients();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      alert("Please enter a task title.");
      return;
    }

    if (!form.assignedTo) {
      alert("Please select a client.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("title", form.title.trim());
      formData.append("description", form.description.trim());
      formData.append("assignedTo", form.assignedTo);
      formData.append("priority", form.priority);

      // Do not send an empty deadline value
      if (form.deadline) {
        formData.append("deadline", form.deadline);
      }

      if (file) {
        formData.append("files", file);
      }

      await createTask(formData);

      alert("Task created and assigned successfully.");

      setForm(initialForm);
      setFile(null);
      setFileInputKey((currentKey) => currentKey + 1);
    } catch (error) {
      console.error("Create task error:", error);
      alert(error.response?.data?.message || "Failed to create task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-3xl">
        <div className="mb-7">
          <h2 className="text-3xl font-bold text-light-text dark:text-dark-text">
            Create Task
          </h2>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Assign work, set its priority, and add a deadline for the client.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-light-border bg-light-card p-6 shadow-sm dark:border-dark-border dark:bg-dark-card md:p-8"
        >
          <div className="grid gap-5">
            {/* Task title */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-light-text dark:text-dark-text">
                Task Title <span className="text-red-500">*</span>
              </label>

              <input
                name="title"
                placeholder="Example: Complete dashboard UI"
                value={form.title}
                onChange={handleChange}
                className="w-full rounded-xl border border-light-border bg-light-bg px-4 py-3 text-light-text outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-light-text dark:text-dark-text">
                Description
              </label>

              <textarea
                name="description"
                rows="4"
                placeholder="Explain what the client needs to complete..."
                value={form.description}
                onChange={handleChange}
                className="w-full resize-none rounded-xl border border-light-border bg-light-bg px-4 py-3 text-light-text outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
              />
            </div>

            {/* Client + Priority */}
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-light-text dark:text-dark-text">
                  Assign Client <span className="text-red-500">*</span>
                </label>

                <select
                  name="assignedTo"
                  value={form.assignedTo}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-light-border bg-light-bg px-4 py-3 text-light-text outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
                >
                  <option value="">Select a client</option>

                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.name} — {client.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-light-text dark:text-dark-text">
                  Priority
                </label>

                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-light-border bg-light-bg px-4 py-3 text-light-text outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-light-text dark:text-dark-text">
                Deadline
              </label>

              <input
                type="datetime-local"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full rounded-xl border border-light-border bg-light-bg px-4 py-3 text-light-text outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
              />

              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Optional. Leave empty if this task has no fixed deadline.
              </p>
            </div>

            {/* File */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-light-text dark:text-dark-text">
                Attach Reference File
              </label>

              <input
                key={fileInputKey}
                type="file"
                className="w-full rounded-xl border border-light-border bg-light-bg p-3 text-sm text-light-text dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
              />

              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Optional: PDF, image, video, or another supporting file.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating Task..." : "Create & Assign Task"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

export default CreateTask;