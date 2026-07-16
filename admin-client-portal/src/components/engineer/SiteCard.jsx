export default function SiteCard({ task }) {
  const siteAddress = task?.siteAddress || "102, Industrial Zone, Phase II, Bengaluru, India";
  const siteManager = task?.siteManager || "Dave Miller (Site Supervisor)";
  const accessHours = task?.accessHours || "08:00 AM - 06:00 PM (Mon - Sat)";
  const locationCoords = task?.locationCoords || "12.9716° N, 77.5946° E";

  const handleOpenMap = () => {
    if (locationCoords.startsWith("http://") || locationCoords.startsWith("https://")) {
      window.open(locationCoords, "_blank");
    } else {
      const query = locationCoords || siteAddress;
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, "_blank");
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition-all duration-300 hover:border-slate-700 hover:shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>📍</span> Site Location
        </h3>
        <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-855 text-indigo-400">
          On-Site Job
        </span>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl bg-slate-800/40 border border-slate-700/30 p-4">
          <p className="text-sm text-white font-medium leading-relaxed">{siteAddress}</p>
          <p className="text-xs text-slate-500 font-mono mt-1">{locationCoords}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block uppercase tracking-wider mb-1">Supervisor</span>
            <span className="text-slate-200 font-semibold">{siteManager}</span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase tracking-wider mb-1">Access Hours</span>
            <span className="text-slate-200 font-semibold">{accessHours}</span>
          </div>
        </div>

        {/* Visual Map/Radar Mockup (Clickable to open map) */}
        <div
          onClick={handleOpenMap}
          className="relative h-32 rounded-xl bg-slate-950 overflow-hidden border border-slate-850 flex items-center justify-center cursor-pointer hover:border-indigo-500/50 transition duration-300 group"
          title="Click to view on Google Maps"
        >
          {/* Custom Grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:16px_16px] opacity-30"></div>
          
          {/* Radar scan animation line */}
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/0 via-indigo-500/10 to-indigo-500/0 origin-bottom animate-pulse"></div>

          {/* Centered marker with pulse ripple */}
          <div className="relative z-10 flex flex-col items-center">
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500 shadow-[0_0_10px_#6366f1]"></span>
            </span>
            <span className="mt-1 bg-slate-900/90 text-[10px] text-indigo-300 font-mono px-2 py-0.5 rounded-full border border-indigo-500/30 group-hover:bg-indigo-600 group-hover:text-white transition duration-200">
              🗺️ Open in Google Maps
            </span>
          </div>

          <div className="absolute bottom-2 left-2 text-[10px] text-slate-500 font-mono">
            SYS_LOC_OK // MAP_LAUNCH
          </div>
        </div>
      </div>
    </div>
  );
}
