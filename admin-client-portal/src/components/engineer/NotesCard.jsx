export default function NotesCard({ task }) {
  const description = task?.description || "No special descriptions or guidelines provided for this task.";

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition-all duration-300 hover:border-slate-700 hover:shadow-lg">
      {/* Scope Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
          <span>📋</span> Scope & Guidelines
        </h3>

        <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-4">
          <p className="text-xs text-slate-350 leading-relaxed whitespace-pre-wrap">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
