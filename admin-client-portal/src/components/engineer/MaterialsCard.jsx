import { useState } from "react";
import { addMaterial } from "../../services/taskService";
import { motion, AnimatePresence } from "framer-motion";

export default function MaterialsCard({ task, onRefresh }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState("pcs");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const materials = task?.materials || [];
  const status = task?.status || "pending";

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    if (!name.trim() || !qty.trim()) return;

    try {
      setSubmitting(true);
      await addMaterial(task._id, { name: name.trim(), qty: qty.trim(), unit, remarks: remarks.trim() });
      setName("");
      setQty("");
      setUnit("pcs");
      setRemarks("");
      setShowAddForm(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      alert("Failed to allocate material to task.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition-all duration-300 hover:border-slate-700 hover:shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>🧱</span> Materials Consumed
        </h3>
        <div className="flex gap-2">
          {status === "in-progress" && (
            <button
              onClick={() => setShowAddForm((prev) => !prev)}
              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider transition active:scale-95 shadow-md"
            >
              {showAddForm ? "Cancel" : "Add Material"}
            </button>
          )}
          <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-850 text-slate-400">
            {materials.length} Items
          </span>
        </div>
      </div>

      {/* Add Material Inline Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddMaterial}
            className="bg-slate-950/40 border border-slate-850 rounded-xl p-4 space-y-3 overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6">
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">
                  Material / Part Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. PVC Pressure Pipe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">
                  Qty
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">
                  Unit
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50"
                >
                  <option value="pcs">pcs</option>
                  <option value="feet">feet</option>
                  <option value="bags">bags</option>
                  <option value="rolls">rolls</option>
                  <option value="units">units</option>
                  <option value="liters">liters</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">
                Remarks / Purpose
              </label>
              <input
                type="text"
                placeholder="e.g. Installed in target pipeline junction"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-750 text-white font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-xl transition disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save Allocation"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider">
              <th className="pb-3 font-semibold">Material Name</th>
              <th className="pb-3 px-3 font-semibold text-center">Qty</th>
              <th className="pb-3 px-3 font-semibold">Remarks</th>
              <th className="pb-3 font-semibold text-right">Allocation Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {materials.map((m, i) => (
              <tr key={i} className="hover:bg-slate-850/20 transition-colors">
                <td className="py-3 text-slate-200 font-medium">{m.name}</td>
                <td className="py-3 px-3 text-indigo-400 font-bold text-center font-mono">
                  {m.qty} <span className="text-[10px] text-slate-500 font-normal">{m.unit}</span>
                </td>
                <td className="py-3 px-3 text-slate-400 italic max-w-xs truncate" title={m.remarks}>
                  {m.remarks || "No remarks"}
                </td>
                <td className="py-3 text-right text-slate-500 font-mono text-[10px]">
                  {m.createdAt ? new Date(m.createdAt).toLocaleDateString("en-IN") : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {materials.length === 0 && (
          <p className="text-xs text-slate-500 italic text-center py-6 bg-slate-950/10 rounded-xl border border-slate-850/50">
            No specific materials allocated to this task yet.
          </p>
        )}
      </div>
    </div>
  );
}
