export default function PageLoader() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 p-8">
      <div className="relative">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xl animate-pulse">
          <span>🏗️</span>
        </div>
        <div className="absolute -inset-1 rounded-2xl border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-xs font-bold uppercase tracking-wider text-indigo-400">Loading Workspace</p>
        <p className="text-[10px] text-slate-500 font-medium">ConstructAI ERP</p>
      </div>
    </div>
  );
}
