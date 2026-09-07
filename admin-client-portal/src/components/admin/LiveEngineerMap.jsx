import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Navigation, 
  Phone, 
  MessageSquare, 
  RefreshCw, 
  Radio, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Search,
  Users
} from "lucide-react";
import socket from "../../socket";
import { getClients } from "../../services/userService";

export default function LiveEngineerMap({ tasks = [] }) {
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEngineer, setSelectedEngineer] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [lastSyncTime, setLastSyncTime] = useState(new Date());

  const fetchEngineerData = async () => {
    try {
      setLoading(true);
      const res = await getClients();
      // Filter clients with engineer role or client role that have location data
      const engineerList = (res.data || []).filter(
        (u) => u.role === "client" || u.role === "engineer"
      );
      setEngineers(engineerList);
      setLastSyncTime(new Date());
    } catch (err) {
      console.error("Failed to fetch engineer locations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEngineerData();

    // Listen for live socket broadcast when an engineer's GPS changes
    const handleLocationUpdate = (data) => {
      setEngineers((prev) =>
        prev.map((eng) => {
          if (eng._id === data.userId) {
            return {
              ...eng,
              currentLocation: data.currentLocation,
            };
          }
          return eng;
        })
      );
      setLastSyncTime(new Date());
    };

    socket.on("engineer_location_updated", handleLocationUpdate);

    // Auto-poll every 60 seconds
    const interval = setInterval(fetchEngineerData, 60000);

    return () => {
      socket.off("engineer_location_updated", handleLocationUpdate);
      clearInterval(interval);
    };
  }, []);

  // Find active task for an engineer
  const getEngineerActiveTask = (engineerId) => {
    return tasks.find(
      (t) => (t.assignedTo?._id === engineerId || t.assignedTo === engineerId) && t.status !== "completed"
    );
  };

  // Determine engineer operational status
  const getEngineerStatus = (eng) => {
    const activeTask = getEngineerActiveTask(eng._id);
    if (!activeTask) return { label: "Idle / Available", color: "slate", icon: "⚪" };
    if (activeTask.visitStatus === "reached-site" || activeTask.visitStatus === "inspection-started") {
      return { label: "On Site (Inspecting)", color: "emerald", icon: "🟢" };
    }
    if (activeTask.visitStatus === "travel-started" || activeTask.status === "in-progress") {
      return { label: "In Transit / En Route", color: "amber", icon: "🟡" };
    }
    return { label: "Assigned Task", color: "indigo", icon: "🔵" };
  };

  // Format last ping time
  const formatLastPing = (updatedAt) => {
    if (!updatedAt) return "No GPS signal yet";
    const diff = Math.floor((new Date() - new Date(updatedAt)) / 1000);
    if (diff < 60) return "Just now (< 1m ago)";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(updatedAt).toLocaleDateString("en-IN");
  };

  // Filtered engineers list
  const filteredEngineers = engineers.filter((eng) => {
    const matchesSearch = 
      eng.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eng.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eng.phone?.includes(searchQuery);

    const status = getEngineerStatus(eng);
    const matchesStatus = 
      statusFilter === "all" ||
      (statusFilter === "onsite" && status.color === "emerald") ||
      (statusFilter === "transit" && status.color === "amber") ||
      (statusFilter === "idle" && status.color === "slate");

    return matchesSearch && matchesStatus;
  });

  const activeEngineer = selectedEngineer || filteredEngineers.find(e => e.currentLocation?.lat) || filteredEngineers[0];

  const mapLat = activeEngineer?.currentLocation?.lat || 13.0827; // Default Chennai/Tamil Nadu
  const mapLng = activeEngineer?.currentLocation?.lng || 80.2707;
  const mapZoom = activeEngineer?.currentLocation?.lat ? 15 : 11;

  // OpenStreetMap embed URL
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${mapLng - 0.02}%2C${mapLat - 0.02}%2C${mapLng + 0.02}%2C${mapLat + 0.02}&layer=mapnik&marker=${mapLat}%2C${mapLng}`;

  return (
    <div className="space-y-6">
      {/* Top Banner Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>🛰️ Live Field Radar & GPS Dispatch</span>
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Real-time telemetry and geofence verification across active engineers and site locations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchEngineerData}
              disabled={loading}
              className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-indigo-400" : ""}`} />
              <span>{loading ? "Pinging..." : "Refresh GPS"}</span>
            </button>

            <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
              Synced: {lastSyncTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          </div>
        </div>

        {/* Status Counters Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800/80 mt-5">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5">
            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block">Total Field Force</span>
            <span className="text-xl font-black text-white font-mono mt-0.5 block">{engineers.length}</span>
          </div>

          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-3.5">
            <span className="text-emerald-400 text-[10px] uppercase font-bold tracking-wider block">Active On-Site</span>
            <span className="text-xl font-black text-emerald-400 font-mono mt-0.5 block">
              {engineers.filter(e => getEngineerStatus(e).color === "emerald").length}
            </span>
          </div>

          <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-3.5">
            <span className="text-amber-400 text-[10px] uppercase font-bold tracking-wider block">In Transit</span>
            <span className="text-xl font-black text-amber-400 font-mono mt-0.5 block">
              {engineers.filter(e => getEngineerStatus(e).color === "amber").length}
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">GPS Signal Active</span>
            <span className="text-xl font-black text-indigo-400 font-mono mt-0.5 block">
              {engineers.filter(e => e.currentLocation?.lat).length} / {engineers.length}
            </span>
          </div>
        </div>
      </div>

      {/* Main Map + Fleet Dispatch Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live Interactive GPS Map */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-rose-400" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                {activeEngineer ? `${activeEngineer.name}'s Location Telemetry` : "Live GPS Map"}
              </h4>
            </div>

            {activeEngineer?.currentLocation?.lat && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${activeEngineer.currentLocation.lat},${activeEngineer.currentLocation.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
              >
                <span>Google Maps View</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          {/* Map Viewport Container */}
          <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
            {activeEngineer?.currentLocation?.lat ? (
              <iframe
                title="Engineer Location Map"
                src={osmEmbedUrl}
                className="w-full h-full border-0 opacity-90 hover:opacity-100 transition-opacity"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-500 bg-radial from-slate-900 to-slate-950">
                <Radio className="h-12 w-12 text-slate-600 animate-pulse mb-3" />
                <p className="text-sm font-bold text-slate-300">No Live Coordinates Broadcast Yet</p>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Once the field engineer opens the mobile portal on site, their GPS coordinates will automatically stream here.
                </p>
              </div>
            )}

            {/* Floating Live Telemetry Overlay Card */}
            {activeEngineer && (
              <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl text-xs max-w-xs pointer-events-auto">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-extrabold text-white text-sm">{activeEngineer.name}</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                    getEngineerStatus(activeEngineer).color === "emerald"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : getEngineerStatus(activeEngineer).color === "amber"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-slate-800 text-slate-400"
                  }`}>
                    {getEngineerStatus(activeEngineer).label}
                  </span>
                </div>

                <div className="mt-2 space-y-1 font-mono text-[11px] text-slate-300">
                  <p>
                    <span className="text-slate-500">Coords:</span>{" "}
                    {activeEngineer.currentLocation?.lat ? (
                      <span className="text-indigo-400 font-bold">
                        {activeEngineer.currentLocation.lat.toFixed(5)}, {activeEngineer.currentLocation.lng.toFixed(5)}
                      </span>
                    ) : (
                      "Waiting for GPS"
                    )}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    <span className="text-slate-500">Last Ping:</span> {formatLastPing(activeEngineer.currentLocation?.updatedAt)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Engineer Fleet List & Direct Actions */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-400" />
              <span>Field Fleet Roster</span>
            </h4>
            <span className="text-xs font-mono text-slate-400">{filteredEngineers.length} Engineers</span>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search engineer by name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 text-[10px] font-bold">
              {[
                { id: "all", label: "All" },
                { id: "onsite", label: "🟢 On-Site" },
                { id: "transit", label: "🟡 In-Transit" },
                { id: "idle", label: "⚪ Idle" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${
                    statusFilter === f.id
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-750"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Engineer Cards List */}
          <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
            {filteredEngineers.map((eng) => {
              const status = getEngineerStatus(eng);
              const activeTask = getEngineerActiveTask(eng._id);
              const isSelected = activeEngineer?._id === eng._id;

              return (
                <motion.div
                  key={eng._id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setSelectedEngineer(eng)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-950/40 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/30"
                      : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h5 className="font-extrabold text-white text-xs flex items-center gap-1.5">
                        <span>{status.icon}</span>
                        <span>{eng.name}</span>
                      </h5>
                      <p className="text-[11px] text-slate-400 mt-0.5">{eng.email || eng.phone || "Engineer"}</p>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      status.color === "emerald"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : status.color === "amber"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-slate-800 text-slate-400"
                    }`}>
                      {status.label}
                    </span>
                  </div>

                  {/* Active Task Info if Assigned */}
                  {activeTask && (
                    <div className="mt-2.5 p-2 rounded-xl bg-slate-900 border border-slate-800/80 text-[11px]">
                      <span className="text-slate-500 font-bold text-[9px] uppercase block">Assigned Work</span>
                      <p className="text-slate-200 font-semibold truncate">{activeTask.title}</p>
                      <p className="text-slate-400 text-[10px] mt-0.5">Client: {activeTask.customerName || "Direct"}</p>
                    </div>
                  )}

                  {/* Telemetry & Quick Action Buttons */}
                  <div className="mt-3 pt-2.5 border-t border-slate-850 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 font-mono">
                      📍 {formatLastPing(eng.currentLocation?.updatedAt)}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {eng.phone && (
                        <a
                          href={`https://wa.me/${eng.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white transition"
                          title="WhatsApp Engineer"
                        >
                          <MessageSquare className="h-3 w-3" />
                        </a>
                      )}

                      {eng.currentLocation?.lat && (
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${eng.currentLocation.lat},${eng.currentLocation.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white transition"
                          title="Directions to Engineer"
                        >
                          <Navigation className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {filteredEngineers.length === 0 && !loading && (
              <p className="text-xs text-slate-500 text-center py-6">
                No engineers found matching the selected filter.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
