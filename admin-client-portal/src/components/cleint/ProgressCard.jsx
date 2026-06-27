function ProgressCard({ task, onUpdate }) {
  const progress = task.progress || 0;

  const getColor = () => {
    if (progress < 30) return "bg-red-500";
    if (progress < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const latest =
    task.progressUpdates?.length > 0
      ? task.progressUpdates[task.progressUpdates.length - 1]
      : null;

  return (
    <div className="rounded-2xl bg-slate-800 p-6 mt-5 border border-slate-700">

      <div className="flex justify-between mb-2">
        <h3 className="text-lg font-bold text-white">
          Progress
        </h3>

        <span className="text-green-400 font-bold">
          {progress}%
        </span>
      </div>

      <div className="w-full h-4 rounded-full bg-slate-700 overflow-hidden">

        <div
          className={`${getColor()} h-full transition-all duration-700`}
          style={{
            width: `${progress}%`,
          }}
        />

      </div>

      <p className="mt-4 text-slate-300">
        {progress}% completed
      </p>

      {latest && (
        <div className="mt-5">

          <p className="text-sm text-cyan-400">
            Latest Update
          </p>

          <p className="text-white mt-1">
            {latest.message || "No description"}
          </p>

          <p className="text-xs text-slate-400 mt-2">
            {new Date(latest.createdAt).toLocaleString()}
          </p>

        </div>
      )}

      <button
        onClick={onUpdate}
        className="
        mt-6
        w-full
        bg-blue-600
        hover:bg-blue-700
        py-3
        rounded-xl
        text-white
        font-semibold
        "
      >
        Update Progress
      </button>

    </div>
  );
}

export default ProgressCard;