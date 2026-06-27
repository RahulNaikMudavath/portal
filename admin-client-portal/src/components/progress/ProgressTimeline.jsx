function ProgressTimeline({ updates = [] }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <h3 className="mb-5 text-lg font-bold text-white">
        Progress Timeline
      </h3>

      {updates.length === 0 ? (
        <p className="text-slate-400">
          No progress updates yet.
        </p>
      ) : (
        <div className="space-y-5">
          {[...updates]
            .reverse()
            .map((update, index) => (
              <div
                key={index}
                className="flex gap-4"
              >
                <div className="mt-1 h-3 w-3 rounded-full bg-blue-500" />

                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-semibold text-white">
                      {update.percentage}%
                    </h4>

                    <span className="text-xs text-slate-500">
                      {new Date(
                        update.createdAt
                      ).toLocaleString()}
                    </span>
                  </div>

                  <p className="mt-1 text-slate-300">
                    {update.message}
                  </p>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default ProgressTimeline;