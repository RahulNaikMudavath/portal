import { useEffect, useState } from "react";
import { getEngineers } from "../../services/userService";

export default function AssignEngineerModal({
  isOpen,
  onClose,
  onAssign,
}) {
  const initialState = {
    engineer: "",
    priority: "medium",
    deadline: "",
    estimatedBudget: "",
    notes: "",
  };

  const [formData, setFormData] = useState(initialState);
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const loadEngineers = async () => {
      try {
        const data = await getEngineers();
        setEngineers(data);
      } catch (err) {
        console.error("Failed to load engineers", err);
      }
    };

    loadEngineers();
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.engineer) {
      alert("Please select an engineer.");
      return;
    }

    try {
      setLoading(true);

      await onAssign({
        assignedEngineer: formData.engineer,
        priority: formData.priority,
        deadline: formData.deadline,
        budget: Number(formData.estimatedBudget) || 0,
        notes: formData.notes,
      });

      setFormData(initialState);

      onClose();

    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Failed to assign engineer."
      );

    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">

      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-[650px] p-8 shadow-2xl">

        <h2 className="text-3xl font-bold text-white mb-8">
          👷 Assign Engineer
        </h2>

        <div className="space-y-5">

          <select
            name="engineer"
            value={formData.engineer}
            onChange={handleChange}
            className="w-full bg-slate-800 text-white rounded-xl p-3"
          >
            <option value="">
              Select Engineer
            </option>

            {engineers.map((engineer) => (
              <option
                key={engineer._id}
                value={engineer._id}
              >
                {engineer.name}
              </option>
            ))}
          </select>

          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full bg-slate-800 text-white rounded-xl p-3"
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

            <option value="urgent">
              Urgent
            </option>
          </select>

          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            className="w-full bg-slate-800 text-white rounded-xl p-3"
          />

          <input
            type="number"
            name="estimatedBudget"
            placeholder="Estimated Budget"
            value={formData.estimatedBudget}
            onChange={handleChange}
            className="w-full bg-slate-800 text-white rounded-xl p-3"
          />

          <textarea
            rows={5}
            name="notes"
            placeholder="Internal Notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full bg-slate-800 text-white rounded-xl p-3 resize-none"
          />

        </div>

        <div className="flex justify-end gap-4 mt-8">

          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            {loading
              ? "Creating..."
              : "🚀 Create Work Order"}
          </button>

        </div>

      </div>

    </div>
  );
}