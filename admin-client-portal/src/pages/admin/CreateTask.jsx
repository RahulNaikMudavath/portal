import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getClients } from "../../services/userService";
import { createTask } from "../../services/taskService";

function CreateTask() {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", assignedTo: "" });
  const [file, setFile] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  useEffect(() => {
    getClients().then(res => setClients(res.data));
  }, []);

  const handleSubmit = async () => {
    try {
      const formData = new FormData();

      Object.keys(form).forEach((key) =>
        formData.append(key, form[key])
      );

      if (file) formData.append("files", file);

      await createTask(formData);
      alert("Task Created");

      setForm({ title: "", description: "", assignedTo: "" });
      setFile(null);
      setFileInputKey((prev) => prev + 1);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create task");
    }
  };

  return (
    <AdminLayout>
      <h2 className="text-xl font-bold mb-4">Create Task</h2>

      <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border p-6 rounded-xl shadow max-w-md space-y-4">

        <input
          placeholder="Title"
          value={form.title}
          className="w-full border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-card text-light-text dark:text-dark-text p-2 rounded"
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
        />

        <input
          placeholder="Description"
          value={form.description}
          className="w-full border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-card text-light-text dark:text-dark-text p-2 rounded"
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <select
          value={form.assignedTo}
          className="w-full border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-card text-light-text dark:text-dark-text p-2 rounded"
          onChange={(e) =>
            setForm({ ...form, assignedTo: e.target.value })
          }
        >
          <option value="">Select Client</option>
          {clients.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          key={fileInputKey}
          type="file"
          className="w-full p-2"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors"
        >
          Create Task
        </button>

      </div>
    </AdminLayout>
  );
}

export default CreateTask;