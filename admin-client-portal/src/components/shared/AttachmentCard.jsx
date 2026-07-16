export default function AttachmentCard({ task }) {
  const adminFiles = task?.files || [];
  const clientFiles = task?.submissionFiles || [];

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

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition-all duration-300 hover:border-slate-700 hover:shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>📎</span> Project Attachments
        </h3>
        <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-850 text-slate-400">
          {adminFiles.length + clientFiles.length} Files
        </span>
      </div>

      <div className="space-y-5">
        {/* Admin files section */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
            Assigned Materials / Specifications
          </h4>
          <div className="space-y-2">
            {adminFiles.map((file, idx) => (
              <div
                key={`admin-file-${idx}`}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-950/40 hover:bg-slate-950/70 border border-slate-800 rounded-xl p-4 transition duration-200"
              >
                <div className="truncate">
                  <p className="text-sm font-semibold text-white truncate">
                    📄 {getFileName(file)}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Admin Attachment</p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={getFileURL(file)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg text-white font-medium transition duration-200"
                  >
                    View
                  </a>
                  <a
                    href={getFileURL(file)}
                    download
                    className="text-xs bg-slate-800 hover:bg-slate-750 border border-slate-700 px-3 py-1.5 rounded-lg text-slate-200 font-medium transition duration-200"
                  >
                    Download
                  </a>
                </div>
              </div>
            ))}

            {adminFiles.length === 0 && (
              <p className="text-xs text-slate-500 italic p-2 bg-slate-950/20 rounded border border-dashed border-slate-800">
                No specification sheets attached by administrator.
              </p>
            )}
          </div>
        </div>

        {/* Client submission files section */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
            Your Uploaded Work Submissions
          </h4>
          <div className="space-y-2">
            {clientFiles.map((file, idx) => (
              <div
                key={`client-file-${idx}`}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-950/40 hover:bg-slate-950/70 border border-slate-800 rounded-xl p-4 transition duration-200"
              >
                <div className="truncate">
                  <p className="text-sm font-semibold text-white truncate">
                    📦 {getFileName(file)}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Submitted Work</p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={getFileURL(file)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg text-white font-medium transition duration-200"
                  >
                    View
                  </a>
                  <a
                    href={getFileURL(file)}
                    download
                    className="text-xs bg-slate-800 hover:bg-slate-750 border border-slate-700 px-3 py-1.5 rounded-lg text-slate-200 font-medium transition duration-200"
                  >
                    Download
                  </a>
                </div>
              </div>
            ))}

            {clientFiles.length === 0 && (
              <p className="text-xs text-slate-500 italic p-2 bg-slate-950/20 rounded border border-dashed border-slate-800">
                No work files submitted yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
