export default function ProgressCard({ task, onUpdate }) {
  const progress = task?.progress || 0;
  const isInProgress = task?.status === "in-progress";

  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 transition-all duration-300 hover:border-slate-700 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-xl text-white font-bold flex items-center gap-2">
          <span>📈</span> Progress
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-green-400 font-bold">{progress}%</span>
          {isInProgress && onUpdate && (
            <button
              onClick={onUpdate}
              className="text-xs bg-indigo-600 hover:bg-indigo-755 text-white px-2.5 py-1 rounded-md font-semibold transition"
            >
              Update
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 h-4 bg-slate-800 rounded-full overflow-hidden">
        <div
          style={{ width: `${progress}%` }}
          className="bg-green-500 h-full transition-all duration-700"
        />
      </div>
    </div>
  );
}
