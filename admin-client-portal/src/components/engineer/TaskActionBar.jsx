import { useState, useRef } from "react";
import { addTaskComment } from "../../services/commentService";
import { uploadTaskAttachment, addMaterial, addTaskNote } from "../../services/taskService";
import { motion, AnimatePresence } from "framer-motion";

export default function TaskActionBar({
  task,
  onStartTask,
  onProgressUpdate,
  onSubmitWork,
  onRefresh,
}) {
  const [activeForm, setActiveForm] = useState(null); // note, material
  
  // Note Form State
  const [noteText, setNoteText] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Material Form State
  const [matName, setMatName] = useState("");
  const [matQty, setMatQty] = useState("");
  const [matUnit, setMatUnit] = useState("pcs");
  const [matRemarks, setMatRemarks] = useState("");
  const [isSubmittingMat, setIsSubmittingMat] = useState(false);

  // Upload States
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);

  const getNormalizedStatus = (dbStatus) => {
    if (!dbStatus || dbStatus === "assigned" || dbStatus === "pending" || dbStatus === "accepted") {
      return "pending";
    }
    if (dbStatus === "working" || dbStatus === "in-progress") {
      return "in-progress";
    }
    return "completed";
  };

  const status = getNormalizedStatus(task?.status);
  const reviewStatus = task?.reviewStatus;
  const isField = task?.taskCategory === "field";

  // Handle Note Submit
  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    try {
      setIsSubmittingNote(true);
      await Promise.all([
        addTaskComment(task._id, noteText.trim()),
        addTaskNote(task._id, noteText.trim())
      ]);
      setNoteText("");
      setActiveForm(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      alert("Failed to save note.");
    } finally {
      setIsSubmittingNote(false);
    }
  };

  // Handle Material Submit
  const handleMaterialSubmit = async (e) => {
    e.preventDefault();
    if (!matName.trim() || !matQty.trim()) return;
    try {
      setIsSubmittingMat(true);
      await addMaterial(task._id, {
        name: matName.trim(),
        qty: matQty.trim(),
        unit: matUnit,
        remarks: matRemarks.trim(),
      });
      setMatName("");
      setMatQty("");
      setMatUnit("pcs");
      setMatRemarks("");
      setActiveForm(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      alert("Failed to allocate material.");
    } finally {
      setIsSubmittingMat(false);
    }
  };

  // Handle Attachment Upload
  const handleFileUpload = async (e, type) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    try {
      setIsUploading(true);
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });
      await uploadTaskAttachment(task._id, formData);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      alert("Failed to upload attachments.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  // 1. Pending Status
  if (status === "pending") {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-white">Activate Work Space</p>
          <p className="text-xs text-slate-400 mt-1">Start task timer when you arrive or begin active preparation.</p>
        </div>
        <button
          onClick={onStartTask}
          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-750 text-white font-bold px-6 py-3 rounded-xl transition duration-200 active:scale-95 text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/40"
        >
          <span>▶</span> Start Task
        </button>
      </div>
    );
  }

  // 2. Submitted Review Pending Status
  if (status === "completed" && reviewStatus === "pending") {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between gap-4 text-slate-350">
        <div className="flex items-center gap-3">
          <span className="text-xl">⏳</span>
          <div>
            <p className="text-sm font-bold text-white">Waiting for Admin Review</p>
            <p className="text-xs text-slate-500 mt-0.5">Workspace lock active. Awaiting review of work logs.</p>
          </div>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-450 uppercase tracking-wider animate-pulse">
          Under Review
        </span>
      </div>
    );
  }

  // 3. Completed & Approved Status
  if (status === "completed" && reviewStatus === "approved") {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 text-emerald-450">
        <span className="text-2xl">✅</span>
        <div>
          <p className="text-sm font-bold text-white">Task Completed & Approved</p>
          <p className="text-xs text-slate-500 mt-0.5">All actions finalized and locked in read-only mode.</p>
        </div>
      </div>
    );
  }

  // 4. In Progress Status
  return (
    <div className="space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2.5">
          {/* Add Note */}
          <button
            onClick={() => setActiveForm(activeForm === "note" ? null : "note")}
            className={`flex items-center gap-2 border text-[10px] font-bold uppercase tracking-wider px-3.5 py-2.5 rounded-xl transition duration-200 ${
              activeForm === "note"
                ? "bg-indigo-650 text-white border-indigo-500"
                : "bg-slate-800 hover:bg-slate-750 border-slate-700/60 text-slate-205"
            }`}
          >
            <span>📝</span> Note
          </button>

          {/* Upload Attachment */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 border border-slate-700/60 text-slate-205 text-[10px] font-bold uppercase tracking-wider px-3.5 py-2.5 rounded-xl transition duration-200 disabled:opacity-50"
          >
            <span>📎</span> File
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileUpload(e, "file")}
            multiple
            className="hidden"
          />

          {/* Upload Photo (Field Only) */}
          {isField && (
            <>
              <button
                onClick={() => photoInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 border border-slate-700/60 text-slate-205 text-[10px] font-bold uppercase tracking-wider px-3.5 py-2.5 rounded-xl transition duration-200 disabled:opacity-50"
              >
                <span>📷</span> Photo
              </button>
              <input
                type="file"
                ref={photoInputRef}
                onChange={(e) => handleFileUpload(e, "photo")}
                multiple
                accept="image/*"
                className="hidden"
              />
            </>
          )}

          {/* Add Material (Field Only) */}
          {isField && (
            <button
              onClick={() => setActiveForm(activeForm === "material" ? null : "material")}
              className={`flex items-center gap-2 border text-[10px] font-bold uppercase tracking-wider px-3.5 py-2.5 rounded-xl transition duration-200 ${
                activeForm === "material"
                  ? "bg-indigo-650 text-white border-indigo-500"
                  : "bg-slate-800 hover:bg-slate-750 border-slate-700/60 text-slate-205"
              }`}
            >
              <span>🧱</span> Material
            </button>
          )}

          {/* Update Progress */}
          <button
            onClick={onProgressUpdate}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 border border-slate-700/60 text-slate-205 text-[10px] font-bold uppercase tracking-wider px-3.5 py-2.5 rounded-xl transition duration-200"
          >
            <span>📈</span> Progress
          </button>
        </div>

        {/* Submit Work */}
        <button
          onClick={onSubmitWork}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4.5 py-2.5 rounded-xl transition duration-250 shadow-md active:scale-95 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2"
        >
          <span>📤</span> Submit Work
        </button>
      </div>

      {/* Inline Forms Container */}
      <AnimatePresence>
        {activeForm === "note" && (
          <motion.form
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            onSubmit={handleNoteSubmit}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3"
          >
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              New Site Note
            </label>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Write observations, checklist items, or questions..."
              rows={3}
              className="w-full bg-slate-955 border border-slate-805 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
              required
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setActiveForm(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingNote}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-bold"
              >
                {isSubmittingNote ? "Saving..." : "Save Note"}
              </button>
            </div>
          </motion.form>
        )}

        {activeForm === "material" && (
          <motion.form
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            onSubmit={handleMaterialSubmit}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3"
          >
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Add Allocated Material</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Name</label>
                <input
                  type="text"
                  placeholder="e.g. Copper wire"
                  value={matName}
                  onChange={(e) => setMatName(e.target.value)}
                  className="w-full bg-slate-955 border border-slate-805 rounded-lg p-2 text-xs text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Qty</label>
                <input
                  type="text"
                  placeholder="e.g. 5"
                  value={matQty}
                  onChange={(e) => setMatQty(e.target.value)}
                  className="w-full bg-slate-955 border border-slate-805 rounded-lg p-2 text-xs text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Unit</label>
                <select
                  value={matUnit}
                  onChange={(e) => setMatUnit(e.target.value)}
                  className="w-full bg-slate-955 border border-slate-805 rounded-lg p-2 text-xs text-slate-300"
                >
                  <option value="pcs">pcs</option>
                  <option value="feet">feet</option>
                  <option value="bags">bags</option>
                  <option value="rolls">rolls</option>
                  <option value="units">units</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Remarks</label>
              <input
                type="text"
                placeholder="e.g. Installed in main panel"
                value={matRemarks}
                onChange={(e) => setMatRemarks(e.target.value)}
                className="w-full bg-slate-955 border border-slate-850 rounded-lg p-2 text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 text-xs pt-1">
              <button
                type="button"
                onClick={() => setActiveForm(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-350 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingMat}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-bold"
              >
                {isSubmittingMat ? "Saving..." : "Add Material"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}