import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AttachmentsCard({ task }) {
  const [previewFile, setPreviewFile] = useState(null);

  const adminFiles = task?.files || [];
  const clientFiles = task?.submissionFiles || [];
  const allFiles = [
    ...adminFiles.map(file => ({ path: file, type: "admin", label: "Admin File" })),
    ...clientFiles.map(file => ({ path: file, type: "client", label: "Submitted Work" }))
  ];

  const getFileName = (path) => {
    if (!path) return "Unknown_File";
    return path.split(/[\\/]/).pop();
  };

  const getFileURL = (path) => {
    if (!path) return "#";
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    return `http://localhost:5001/${path}`;
  };

  const isImageFile = (path) => {
    const lower = path.toLowerCase();
    return lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".webp") || lower.endsWith(".gif");
  };

  const handleOpenLink = (path) => {
    window.open(getFileURL(path), "_blank");
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition-all duration-300 hover:border-slate-700 hover:shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>📎</span> Project Attachments
        </h3>
        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-850 text-indigo-400">
          {allFiles.length} Files
        </span>
      </div>

      {allFiles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {allFiles.map((file, idx) => {
            const fileName = getFileName(file.path);
            const isImg = isImageFile(file.path);
            const url = getFileURL(file.path);

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-950/40 border border-slate-800 rounded-xl p-3 flex flex-col justify-between hover:border-slate-700 transition space-y-3 group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl pt-1">
                    {isImg ? "🖼️" : "📄"}
                  </span>
                  <div className="truncate flex-1">
                    <p
                      className="text-xs font-bold text-white truncate group-hover:text-indigo-400 transition cursor-pointer"
                      onClick={() => handleOpenLink(file.path)}
                    >
                      {fileName}
                    </p>
                    <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mt-1.5 ${
                      file.type === "admin"
                        ? "bg-indigo-500/10 text-indigo-455 border border-indigo-500/20"
                        : "bg-emerald-500/10 text-emerald-450 border border-emerald-500/20"
                    }`}>
                      {file.label}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 text-[10px] uppercase font-bold tracking-wider pt-2 border-t border-slate-900">
                  {isImg ? (
                    <button
                      onClick={() => setPreviewFile(url)}
                      className="flex-1 py-1.5 text-center text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/20 rounded-lg transition"
                    >
                      Preview
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenLink(file.path)}
                      className="flex-1 py-1.5 text-center text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/20 rounded-lg transition"
                    >
                      Open
                    </button>
                  )}
                  <a
                    href={url}
                    download={fileName}
                    className="flex-1 py-1.5 text-center text-slate-350 bg-slate-800 hover:bg-slate-750 border border-slate-700/60 rounded-lg transition flex items-center justify-center gap-1"
                  >
                    📥 Get
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-slate-500 italic py-6 text-center bg-slate-950/10 rounded-xl border border-slate-850/50">
          No files or specification sheets attached to this task.
        </p>
      )}

      {/* Preview Modal for Images */}
      <AnimatePresence>
        {previewFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewFile(null)}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl border border-slate-800 bg-slate-955"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewFile(null)}
                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/60 text-white flex items-center justify-center font-bold hover:bg-black/85 hover:text-red-400 transition"
              >
                ✕
              </button>
              <img
                src={previewFile}
                alt="Attachment Preview"
                className="max-w-full max-h-[80vh] object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
