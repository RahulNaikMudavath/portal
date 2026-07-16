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
  siteAddress: "",
  locationCoords: "",
  siteManager: "",
  accessHours: "",
  priority: "medium",
  taskCategory: "office",
  engineer: "",
  deadline: "",
};

export default function CreateTask() {
  const navigate = useNavigate();
  const { draftRequest } = useWorkRequest();
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const loadEngineers = async () => {
    try {
      const data = await getEngineers();
      setEngineers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadEngineers();
  }, []);

  useEffect(() => {
    if (!draftRequest) return;
    setForm({
      customerName: draftRequest.customerName || "",
      phoneNumber: draftRequest.phoneNumber || "",
      title: draftRequest.subject || "",
      description: draftRequest.description || "",
      projectType: draftRequest.projectType || "",
      estimatedBudget: draftRequest.estimatedBudget || "",
      siteAddress: "",
      locationCoords: "",
      siteManager: "",
      accessHours: "",
      priority: draftRequest.priority?.toLowerCase() || "medium",
      taskCategory: "office",
      engineer: "",
      deadline: ""
    });
  }, [draftRequest]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
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
      formData.append("taskCategory", form.taskCategory);
      formData.append("customerName", form.customerName);
      formData.append("phoneNumber", form.phoneNumber);

      if (form.taskCategory === "office") {
        formData.append("projectType", form.projectType);
        formData.append("estimatedBudget", form.estimatedBudget);
      } else {
        formData.append("siteAddress", form.siteAddress);
        formData.append("locationCoords", form.locationCoords);
        formData.append("siteManager", form.siteManager);
        formData.append("accessHours", form.accessHours);
      }

      if (form.deadline) {
        formData.append("deadline", form.deadline);
      }
      if (draftRequest?._id) {
        formData.append("workRequestId", draftRequest._id);
      }

      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append("files", selectedFiles[i]);
      }

      await createTask(formData);

      alert("✅ Task Created Successfully!");
      setForm(initialForm);
      setSelectedFiles([]);
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

        {/* Conditional Category Fields */}
        {form.taskCategory === "office" ? (
          <div className="grid grid-cols-2 gap-6 bg-slate-900/40 p-5 rounded-2xl border border-slate-800">
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
        ) : (
          <div className="space-y-6 bg-slate-900/40 p-5 rounded-2xl border border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-400 mb-2">
                  Site Manager / Supervisor
                </label>
                <input
                  type="text"
                  name="siteManager"
                  value={form.siteManager}
                  onChange={handleChange}
                  placeholder="Dave Miller (Site Supervisor)"
                  className="w-full bg-slate-800 rounded-lg p-3 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2">
                  Access Hours
                </label>
                <input
                  type="text"
                  name="accessHours"
                  value={form.accessHours}
                  onChange={handleChange}
                  placeholder="08:00 AM - 06:00 PM (Mon - Sat)"
                  className="w-full bg-slate-800 rounded-lg p-3 text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-400 mb-2">
                  Site Address
                </label>
                <input
                  type="text"
                  name="siteAddress"
                  value={form.siteAddress}
                  onChange={handleChange}
                  placeholder="102, Industrial Zone, Phase II, Bengaluru, India"
                  className="w-full bg-slate-800 rounded-lg p-3 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2">
                  Location Coordinates / Google Maps link
                </label>
                <input
                  type="text"
                  name="locationCoords"
                  value={form.locationCoords}
                  onChange={handleChange}
                  placeholder="12.9716 N, 77.5946 E"
                  className="w-full bg-slate-800 rounded-lg p-3 text-white"
                />
              </div>
            </div>
          </div>
        )}

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

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
              <label className="block text-sm font-medium text-slate-300 mb-2">
                  Task Category
              </label>

              <select
                  name="taskCategory"
                  value={form.taskCategory}
                  onChange={handleChange}
                  className="w-full bg-slate-800 rounded-lg p-3 text-white"
              >
                  <option value="office">📄 Office Task</option>
                  <option value="field">👷 Field Task</option>
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

        {/* Attachments / Maps / Documents */}
        <div>
          <label className="block text-gray-400 mb-2">
            Project Attachments & Maps
          </label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full bg-slate-800 border border-slate-700/50 rounded-lg p-3 text-white text-sm"
          />
          {selectedFiles.length > 0 && (
            <div className="mt-2 text-xs text-indigo-400">
              Selected files: {selectedFiles.map(f => f.name).join(", ")}
            </div>
          )}
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