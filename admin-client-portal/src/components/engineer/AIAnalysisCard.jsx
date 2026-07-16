export default function AIAnalysisCard({ task }) {
  if (!task || !task.aiSummary) {
    return null;
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 transition-all duration-300 hover:border-slate-700 hover:shadow-lg">
      <h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
        <span>🤖</span> AI Analysis
      </h2>

      <div className="mt-4 bg-slate-950/40 border border-slate-850 rounded-xl p-4">
        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
          {task.aiSummary}
        </p>
      </div>
    </div>
  );
}
