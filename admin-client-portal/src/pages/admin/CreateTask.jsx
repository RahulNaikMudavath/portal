import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";
import { useWorkRequest } from "../../context/WorkRequestContext";

import { getEngineers } from "../../services/userService";
import { createTask } from "../../services/taskService";

const initialForm = {
  customerName: "",
  phoneNumber: "",
  title: "",
  description: "",
  projectType: "",
  estimatedBudget: "",
  priority: "medium",
  engineer: "",
  deadline: "",
};

export default function CreateTask() {

    const navigate = useNavigate();

    const { draftRequest } = useWorkRequest();

    const [engineers, setEngineers] = useState([]);

    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState(initialForm);

    useEffect(() => {

    loadEngineers();

}, []);

useEffect(() => {

    if (!draftRequest) return;

    setForm({

        customerName:
            draftRequest.customerName || "",

        phoneNumber:
            draftRequest.phoneNumber || "",

        title:
            draftRequest.subject || "",

        description:
            draftRequest.description || "",

        projectType:
            draftRequest.projectType || "",

        estimatedBudget:
            draftRequest.estimatedBudget || "",

        priority:
            draftRequest.priority?.toLowerCase() || "medium",

        engineer: "",

        deadline: ""

    });

}, [draftRequest]);

const loadEngineers = async () => {

    try {

        const data = await getEngineers();

        setEngineers(data);

    }

    catch (err) {

        console.error(err);

    }

};

const handleChange = (e) => {

    setForm({

        ...form,

        [e.target.name]: e.target.value

    });

};
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);

    if (!form.engineer) {
      alert("Please select an engineer");
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("assignedTo", form.engineer);
    formData.append("priority", form.priority);
    if (form.deadline) {
      formData.append("deadline", form.deadline);
    }
    if (draftRequest?._id) {
      formData.append("workRequestId", draftRequest._id);
    }

    await createTask(formData);

    alert("✅ Task Created Successfully!");

    setForm(initialForm);

    navigate("/admin/tasks");

  } catch (err) {

    console.error(err);

    alert(
      err.response?.data?.message ||
      "Failed to create task."
    );

  } finally {

    setLoading(false);

  }
};

return (
  <AdminLayout>
    <div className="max-w-5xl mx-auto bg-slate-900 rounded-xl shadow-lg p-8">

      <h1 className="text-3xl font-bold text-white mb-8">
        📋 Create Work Request
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-8"
      >

        {/* Customer Information */}

        <div className="grid grid-cols-2 gap-6">

          <div>
            <label className="block text-gray-400 mb-2">
              Customer Name
            </label>

            <input
              type="text"
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              className="w-full bg-slate-800 rounded-lg p-3 text-white"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2">
              Phone Number
            </label>

            <input
              type="text"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              className="w-full bg-slate-800 rounded-lg p-3 text-white"
            />
          </div>

        </div>

        {/* Project */}

        <div className="grid grid-cols-2 gap-6">

          <div>

            <label className="block text-gray-400 mb-2">
              Project Type
            </label>

            <input
              type="text"
              name="projectType"
              value={form.projectType}
              onChange={handleChange}
              className="w-full bg-slate-800 rounded-lg p-3 text-white"
            />

          </div>

          <div>

            <label className="block text-gray-400 mb-2">
              Estimated Budget
            </label>

            <input
              type="text"
              name="estimatedBudget"
              value={form.estimatedBudget}
              onChange={handleChange}
              className="w-full bg-slate-800 rounded-lg p-3 text-white"
            />

          </div>

        </div>

        {/* Subject */}

        <div>

          <label className="block text-gray-400 mb-2">
            Subject
          </label>

          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full bg-slate-800 rounded-lg p-3 text-white"
          />

        </div>

        {/* Description */}

        <div>

          <label className="block text-gray-400 mb-2">
            Description
          </label>

          <textarea
            rows={6}
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full bg-slate-800 rounded-lg p-3 text-white"
          />

        </div>

        {/* Priority + Engineer */}

        <div className="grid grid-cols-2 gap-6">

          <div>

            <label className="block text-gray-400 mb-2">
              Priority
            </label>

            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full bg-slate-800 rounded-lg p-3 text-white"
            >

              <option value="low">
                Low
              </option>

              <option value="medium">
                Medium
              </option>

              <option value="high">
                High
              </option>

            </select>

          </div>

          <div>

            <label className="block text-gray-400 mb-2">
              Assign Engineer
            </label>

            <select
              name="engineer"
              value={form.engineer}
              onChange={handleChange}
              className="w-full bg-slate-800 rounded-lg p-3 text-white"
            >

              <option value="">
                Select Engineer
              </option>

              {engineers.map((eng) => (

                <option
                  key={eng._id}
                  value={eng._id}
                >

                  {eng.name}

                </option>

              ))}

            </select>

          </div>

        </div>

        {/* Deadline */}

        <div>

          <label className="block text-gray-400 mb-2">
            Deadline
          </label>

          <input
            type="date"
            name="deadline"
            value={form.deadline}
            onChange={handleChange}
            className="w-full bg-slate-800 rounded-lg p-3 text-white"
          />

        </div>

        {/* Buttons */}

        <div className="flex justify-end gap-4">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            {loading ? "Creating..." : "🚀 Create Work Request"}
          </button>

        </div>

      </form>

    </div>
  </AdminLayout>
)};