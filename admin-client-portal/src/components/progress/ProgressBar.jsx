function ProgressBar({ progress = 0 }) {
  const getColor = () => {
    if (progress < 30) return "from-red-500 to-red-400";
    if (progress < 70) return "from-yellow-500 to-yellow-400";
    return "from-green-500 to-emerald-400";
  };

  const getStatus = () => {
    if (progress === 100) return "Ready for Review";
    if (progress >= 75) return "Almost Done";
    if (progress >= 50) return "Halfway There";
    if (progress >= 25) return "Work in Progress";
    return "Getting Started";
  };

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">
            Task Progress
          </h3>

          <p className="text-sm text-slate-400">
            {getStatus()}
          </p>
        </div>

        <div className="text-right">
          <h2 className="text-3xl font-bold text-white">
            {progress}%
          </h2>
        </div>
      </div>

      <div className="h-4 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full bg-gradient-to-r ${getColor()} transition-all duration-700`}
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      <div className="mt-3 flex justify-between text-xs text-slate-400">
        <span>Started</span>
        <span>In Progress</span>
        <span>Review Ready</span>
      </div>
    </div>
  );
}

export default ProgressBar;