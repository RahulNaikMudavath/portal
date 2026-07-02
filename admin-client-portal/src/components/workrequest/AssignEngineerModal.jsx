import { useState } from "react";
import { useEffect } from "react";
import { getEngineers } from "../../services/userService";

export default function AssignEngineerModal({
  isOpen,
  onClose,
  onAssign,
}) {
  const [formData, setFormData] = useState({
    engineer: "",
    priority: "medium",
    deadline: "",
    estimatedBudget: "",
    notes: "",
  });
  const [engineers, setEngineers] = useState([]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  useEffect(() => {
    const loadEngineers = async () => {
      try {
        const data = await getEngineers();
        setEngineers(data);
      } catch (err) {
        console.error(err);
      }
    };

    loadEngineers();
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async () => {

    if (!formData.engineer) {
        return alert("Please select an engineer.");
    }

    await onAssign(formData);

};

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

      <div className="bg-slate-900 rounded-2xl w-[600px] p-8 border border-slate-700">

        <h2 className="text-2xl font-bold text-white mb-8">
          👷 Assign Work
        </h2>

        <div className="space-y-5">

          <select
  name="engineer"
  value={formData.engineer}
  onChange={handleChange}
>
  <option value="">Select Engineer</option>

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
            className="w-full p-3 rounded-xl bg-slate-800 text-white"
          >
            <option>low</option>
            <option>medium</option>
            <option>high</option>
            <option>urgent</option>
          </select>

          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-slate-800 text-white"
          />

          <input
            type="number"
            name="estimatedBudget"
            placeholder="Estimated Budget"
            value={formData.estimatedBudget}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-slate-800 text-white"
          />

          <textarea
            rows="4"
            name="notes"
            placeholder="Internal Notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-slate-800 text-white"
          />

        </div>

        <div className="flex justify-end gap-4 mt-8">

          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-slate-700"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700"
          >
            Create Work Order
          </button>

        </div>

      </div>

    </div>
  );
}