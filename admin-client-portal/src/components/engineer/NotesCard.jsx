import { useState } from "react";
import { addTaskNote, editTaskNote, deleteTaskNote } from "../../services/taskService";
import { motion, AnimatePresence } from "framer-motion";

export default function NotesCard({ task, onRefresh }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit states
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editText, setEditText] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const description = task?.description || "No special descriptions or guidelines provided for this task.";
  const notes = task?.notes || [];
  const status = task?.status || "pending";
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = currentUser._id || currentUser.id;

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    try {
      setIsSubmitting(true);
      await addTaskNote(task._id, noteText.trim());
      setNoteText("");
      setShowAddForm(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      alert("Failed to save note");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditNote = async (noteId) => {
    if (!editText.trim()) return;

    try {
      setIsUpdating(true);
      await editTaskNote(task._id, noteId, editText.trim());
      setEditingNoteId(null);
      setEditText("");
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      alert("Failed to edit note");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      await deleteTaskNote(task._id, noteId);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete note");
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition-all duration-300 hover:border-slate-700 hover:shadow-lg space-y-6">
      {/* Scope Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>📝</span> Scope & Guidelines
          </h3>
          <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-850 text-indigo-400">
            SOP Active
          </span>
        </div>

        <div className="bg-slate-950/20 border border-slate-850 rounded-xl p-4">
          <p className="text-sm text-slate-350 leading-relaxed whitespace-pre-wrap">
            {description}
          </p>
        </div>
      </div>

      {/* Interactive Notes Section */}
      <div className="pt-4 border-t border-slate-850/80 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
            <span>📂</span> Internal Site Notes
          </h4>
          {status === "in-progress" && (
            <button
              onClick={() => setShowAddForm(prev => !prev)}
              className="text-[11px] bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider transition"
            >
              {showAddForm ? "Cancel" : "Add Note"}
            </button>
          )}
        </div>

        {/* Add Note Input Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAddNote}
              className="space-y-2.5 overflow-hidden pb-2"
            >
              <textarea
                placeholder="Write your note, checklist, or site details here..."
                rows={3}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full bg-slate-955 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                required
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-xl transition"
                >
                  {isSubmitting ? "Saving..." : "Save Note"}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Notes Feed */}
        <div className="space-y-3">
          {notes.map((note) => {
            const isOwner = note.user?.toString() === currentUserId?.toString();
            const isEditing = editingNoteId === note._id;

            return (
              <motion.div
                key={note._id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-950/20 border border-slate-850 rounded-xl p-4 space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-5 bg-indigo-600/10 text-indigo-400 font-bold flex items-center justify-center rounded-full text-[9px] border border-indigo-500/20">
                      👤
                    </span>
                    <span className="font-bold text-slate-300">
                      {note.userName || "User"}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(note.createdAt).toLocaleString("en-IN")}
                  </span>
                </div>

                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                    />
                    <div className="flex justify-end gap-1.5 text-[10px] uppercase font-bold tracking-wider">
                      <button
                        onClick={() => setEditingNoteId(null)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleEditNote(note._id)}
                        disabled={isUpdating}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-350 leading-relaxed whitespace-pre-wrap">
                    {note.text}
                  </p>
                )}

                {!isEditing && isOwner && status === "in-progress" && (
                  <div className="flex justify-end gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-550 pt-1 border-t border-slate-900/50">
                    <button
                      onClick={() => {
                        setEditingNoteId(note._id);
                        setEditText(note.text);
                      }}
                      className="hover:text-indigo-400 transition"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note._id)}
                      className="hover:text-red-400 transition"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}

          {notes.length === 0 && (
            <p className="text-xs text-slate-550 italic text-center py-4">
              No internal site notes added yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
