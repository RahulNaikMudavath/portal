import { useEffect, useState, useMemo } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getEngineerPerformanceAnalytics } from "../../services/analyticsService";
import API from "../../services/api";
import { 
  Search, Award, Clock, Star, X, Phone, Mail, MapPin, 
  TrendingUp, CheckCircle, AlertTriangle, Briefcase, ChevronRight 
} from "lucide-react";

// Format seconds into readable duration
const formatDuration = (totalSeconds) => {
  if (!totalSeconds || totalSeconds <= 0) return "0s";
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// Tooltip helper component
function Tooltip({ children, content, visible }) {
  if (!visible) return children;
  return (
    <div className="relative group">
      {children}
      <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 border border-slate-700 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-xl">
        {content}
      </div>
    </div>
  );
}

export default function EngineerPerformanceDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEngineer, setSelectedEngineer] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [hoveredHeatmap, setHoveredHeatmap] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await getEngineerPerformanceAnalytics();
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load engineer performance metrics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRevokeAccess = async (engineerId) => {
    const confirmRevoke = window.confirm(
      "Are you sure you want to permanently revoke all access for this engineer? This will sign them out immediately and delete their account credentials."
    );
    if (!confirmRevoke) return;

    try {
      setLoading(true);
      await API.delete(`/api/users/${engineerId}`);
      alert("Access revoked and user deleted successfully.");
      setSelectedEngineer(null);
      fetchAnalytics();
    } catch (err) {
      console.error("Revoke access error:", err);
      alert(err.response?.data?.message || "Failed to revoke access.");
      setLoading(false);
    }
  };

  // Filter rankings by search term
  const filteredRankings = useMemo(() => {
    if (!data || !data.rankings) return [];
    return data.rankings.filter((eng) =>
      eng.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (eng.rollNumber && eng.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [data, searchTerm]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">Gathering performance records...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !data) {
    return (
      <AdminLayout>
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-600 dark:text-red-400 my-10">
          <AlertTriangle className="h-12 w-12 mx-auto mb-3" />
          <h3 className="text-lg font-bold">Error Loading Dashboard</h3>
          <p className="mt-1 text-sm">{error || "No data returned."}</p>
          <button 
            onClick={fetchAnalytics}
            className="mt-4 rounded-xl bg-red-600 px-5 py-2 font-semibold text-white transition hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  const { teamOverview, teamMonthlyTrend, heatmapData } = data;

  // Find max value in monthly trend to scale trend chart
  const maxTrendValue = Math.max(
    ...teamMonthlyTrend.map((t) => Math.max(t.assigned, t.completed, t.delayed)),
    5
  );

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const hourBlocks = [
    "12 AM - 3 AM",
    "3 AM - 6 AM",
    "6 AM - 9 AM",
    "9 AM - 12 PM",
    "12 PM - 3 PM",
    "3 PM - 6 PM",
    "6 PM - 9 PM",
    "9 PM - 12 AM"
  ];

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-light-text dark:text-dark-text sm:text-4xl">
              Engineer Performance Dashboard
            </h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Analyze work orders, response timelines, field output, and client ratings.
            </p>
          </div>
          <button
            onClick={fetchAnalytics}
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Refresh Data
          </button>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Completed Rate */}
          <div className="rounded-2xl border border-light-border bg-light-card p-6 shadow-sm dark:border-dark-border dark:bg-dark-card transition duration-200 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Work Completion</span>
              <span className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-light-text dark:text-dark-text">
                {teamOverview.tasksCompleted} / {teamOverview.tasksAssigned}
              </span>
              <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                Avg. Completion Rate:{" "}
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {teamOverview.tasksAssigned > 0 
                    ? Math.round((teamOverview.tasksCompleted / teamOverview.tasksAssigned) * 100)
                    : 0}%
                </span>
              </p>
            </div>
          </div>

          {/* Card 2: Timelines */}
          <div className="rounded-2xl border border-light-border bg-light-card p-6 shadow-sm dark:border-dark-border dark:bg-dark-card transition duration-200 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Timelines</span>
              <span className="rounded-lg bg-indigo-500/10 p-2 text-indigo-600 dark:text-indigo-400">
                <Clock className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-light-text dark:text-dark-text">
                {formatDuration(teamOverview.avgCompletionTime)}
              </span>
              <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                Avg. Review: <span className="font-semibold">{formatDuration(teamOverview.avgReviewTime)}</span>
              </p>
            </div>
          </div>

          {/* Card 3: Ratings & Quality */}
          <div className="rounded-2xl border border-light-border bg-light-card p-6 shadow-sm dark:border-dark-border dark:bg-dark-card transition duration-200 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Customer Ratings</span>
              <span className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
                <Star className="h-5 w-5 fill-current" />
              </span>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-light-text dark:text-dark-text">{teamOverview.avgRating || "0.0"}</span>
                <span className="text-sm text-gray-500">/ 5.0</span>
              </div>
              <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                Approval Rate: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{teamOverview.approvalRate}%</span>
              </p>
            </div>
          </div>

          {/* Card 4: Work Type Split */}
          <div className="rounded-2xl border border-light-border bg-light-card p-6 shadow-sm dark:border-dark-border dark:bg-dark-card transition duration-200 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Workload & Latency</span>
              <span className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
                <Briefcase className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-bold text-light-text dark:text-dark-text">
                  F:{teamOverview.fieldTasks} | O:{teamOverview.officeTasks}
                </span>
                <span className="text-xs font-semibold text-rose-500 bg-rose-500/10 rounded-full px-2 py-0.5">
                  {teamOverview.delayedTasks} Delayed
                </span>
              </div>
              {/* Simple split meter */}
              <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700">
                <div 
                  className="bg-indigo-600" 
                  style={{ width: `${(teamOverview.fieldTasks / (teamOverview.fieldTasks + teamOverview.officeTasks || 1)) * 100}%` }}
                ></div>
                <div 
                  className="bg-sky-400" 
                  style={{ width: `${(teamOverview.officeTasks / (teamOverview.fieldTasks + teamOverview.officeTasks || 1)) * 100}%` }}
                ></div>
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-gray-400">
                <span>Field ({Math.round((teamOverview.fieldTasks / (teamOverview.fieldTasks + teamOverview.officeTasks || 1)) * 100)}%)</span>
                <span>Office ({Math.round((teamOverview.officeTasks / (teamOverview.fieldTasks + teamOverview.officeTasks || 1)) * 100)}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts & Trends */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Monthly Trend Area Chart */}
          <div className="lg:col-span-2 rounded-2xl border border-light-border bg-light-card p-6 shadow-sm dark:border-dark-border dark:bg-dark-card">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-light-text dark:text-dark-text">Monthly Productivity Trends</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Overview of task volumes and latency indices</p>
              </div>
              <div className="flex gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-indigo-500">
                  <span className="h-3 w-3 rounded-full bg-indigo-500 inline-block"></span> Assigned
                </span>
                <span className="flex items-center gap-1.5 text-emerald-500">
                  <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block"></span> Completed
                </span>
                <span className="flex items-center gap-1.5 text-rose-500">
                  <span className="h-3 w-3 rounded-full bg-rose-500 inline-block"></span> Delayed
                </span>
              </div>
            </div>

            {/* Custom SVG Trend Chart */}
            <div className="relative h-64 w-full">
              <svg viewBox="0 0 600 240" className="h-full w-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="gradientAssigned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0"/>
                  </linearGradient>
                  <linearGradient id="gradientCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0"/>
                  </linearGradient>
                </defs>

                {/* Horizontal Gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((r, idx) => {
                  const y = 20 + r * 180;
                  const label = Math.round(maxTrendValue * (1 - r));
                  return (
                    <g key={idx} className="opacity-40 dark:opacity-20">
                      <line x1="40" y1={y} x2="580" y2={y} stroke="currentColor" strokeDasharray="3 3" className="text-gray-400" />
                      <text x="30" y={y + 4} textAnchor="end" className="text-[10px] fill-current text-gray-400 font-mono">{label}</text>
                    </g>
                  );
                })}

                {/* X Axis Labels */}
                {teamMonthlyTrend.map((item, idx) => {
                  const x = 50 + idx * 100;
                  return (
                    <text key={idx} x={x} y="220" textAnchor="middle" className="text-[10px] fill-current text-gray-400 dark:text-gray-500 font-semibold">
                      {item.month}
                    </text>
                  );
                })}

                {/* Draw Curves & Fills */}
                {(() => {
                  const pointsAssigned = teamMonthlyTrend.map((t, idx) => ({
                    x: 50 + idx * 100,
                    y: 200 - (t.assigned / maxTrendValue) * 180
                  }));
                  const pointsCompleted = teamMonthlyTrend.map((t, idx) => ({
                    x: 50 + idx * 100,
                    y: 200 - (t.completed / maxTrendValue) * 180
                  }));
                  const pointsDelayed = teamMonthlyTrend.map((t, idx) => ({
                    x: 50 + idx * 100,
                    y: 200 - (t.delayed / maxTrendValue) * 180
                  }));

                  const dAssigned = pointsAssigned.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                  const dCompleted = pointsCompleted.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                  const dDelayed = pointsDelayed.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

                  const fillAssigned = `${dAssigned} L 550 200 L 50 200 Z`;
                  const fillCompleted = `${dCompleted} L 550 200 L 50 200 Z`;

                  return (
                    <>
                      {/* Area Fills */}
                      <path d={fillAssigned} fill="url(#gradientAssigned)" />
                      <path d={fillCompleted} fill="url(#gradientCompleted)" />

                      {/* Main Lines */}
                      <path d={dAssigned} fill="none" stroke="#6366f1" strokeWidth="2.5" />
                      <path d={dCompleted} fill="none" stroke="#10b981" strokeWidth="2.5" />
                      <path d={dDelayed} fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" />

                      {/* Interactive Circles / Tooltip Trigger spots */}
                      {pointsCompleted.map((p, idx) => {
                        const item = teamMonthlyTrend[idx];
                        return (
                          <g 
                            key={idx}
                            onMouseEnter={() => setHoveredPoint({ x: p.x, y: p.y, item })}
                            onMouseLeave={() => setHoveredPoint(null)}
                            className="cursor-pointer"
                          >
                            <circle cx={p.x} cy={p.y} r="5" className="fill-white stroke-emerald-500 stroke-2 dark:fill-slate-900" />
                            <circle cx={pointsAssigned[idx].x} cy={pointsAssigned[idx].y} r="4" className="fill-white stroke-indigo-500 stroke-2 dark:fill-slate-900" />
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>

              {/* Hover Tooltip inside SVG card */}
              {hoveredPoint && (
                <div 
                  className="absolute bg-slate-900 dark:bg-slate-950 border border-slate-700 text-white rounded-lg p-3 shadow-xl text-xs space-y-1 pointer-events-none transition-all duration-150"
                  style={{ left: `${(hoveredPoint.x / 600) * 100}%`, top: `${(hoveredPoint.y / 240) * 100 - 35}%`, transform: 'translateX(-50%)' }}
                >
                  <p className="font-bold border-b border-slate-700 pb-1 mb-1 text-indigo-300">{hoveredPoint.item.month}</p>
                  <p className="flex justify-between gap-5 text-gray-300">Assigned: <span className="font-bold text-white">{hoveredPoint.item.assigned}</span></p>
                  <p className="flex justify-between gap-5 text-gray-300">Completed: <span className="font-bold text-emerald-400">{hoveredPoint.item.completed}</span></p>
                  <p className="flex justify-between gap-5 text-gray-300">Delayed: <span className="font-bold text-rose-400">{hoveredPoint.item.delayed}</span></p>
                  <p className="flex justify-between gap-5 text-gray-300">Approval Rate: <span className="font-bold text-sky-400">{hoveredPoint.item.approvalRate}%</span></p>
                </div>
              )}
            </div>
          </div>

          {/* Workload Donut representation / Summary card */}
          <div className="rounded-2xl border border-light-border bg-light-card p-6 shadow-sm dark:border-dark-border dark:bg-dark-card flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-light-text dark:text-dark-text">Task Quality Ratings</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ratings breakdown for completed tasks</p>
            </div>
            
            <div className="my-6 flex items-center justify-center">
              {/* Circular SVG gauge representation */}
              <div className="relative h-40 w-40">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" className="stroke-gray-100 dark:stroke-slate-800" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    className="stroke-amber-400" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray="251.2" 
                    strokeDashoffset={251.2 - (251.2 * (teamOverview.avgRating || 0)) / 5}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-extrabold text-light-text dark:text-dark-text">
                    {teamOverview.avgRating || "0.0"}
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold tracking-wider">TEAM RATING</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center rounded-lg bg-gray-50 dark:bg-slate-850 p-2.5">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400 inline-block"></span> Score Achievement
                </span>
                <span className="font-bold text-light-text dark:text-dark-text">
                  {Math.round(((teamOverview.avgRating || 0) / 5) * 100)}%
                </span>
              </div>
              <div className="flex justify-between items-center rounded-lg bg-gray-50 dark:bg-slate-850 p-2.5">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block"></span> Approval Rate
                </span>
                <span className="font-bold text-light-text dark:text-dark-text">{teamOverview.approvalRate}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Heatmap Section */}
        <div className="rounded-2xl border border-light-border bg-light-card p-6 shadow-sm dark:border-dark-border dark:bg-dark-card">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-light-text dark:text-dark-text">Work Completion Heatmap</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Intensity of task completions by day of week and 3-hour block</p>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[600px] py-4">
              <div className="grid grid-cols-9 gap-1.5">
                {/* Empty corner block */}
                <div></div>
                {/* Hour Header blocks */}
                {hourBlocks.map((block, idx) => (
                  <div key={idx} className="text-center text-[10px] font-semibold text-gray-400 pb-2">
                    {block}
                  </div>
                ))}

                {/* Heatmap matrix rows */}
                {daysOfWeek.map((dayName, dayIdx) => {
                  return (
                    <>
                      {/* Day Label column */}
                      <div className="text-left text-[11px] font-semibold text-gray-500 flex items-center h-9">
                        {dayName.slice(0,3)}
                      </div>
                      {/* 8 Hour columns */}
                      {Array(8).fill(0).map((_, blockIdx) => {
                        const cell = heatmapData.find(h => h.day === dayIdx && h.block === blockIdx);
                        const count = cell ? cell.count : 0;
                        
                        // Calculate opacity/color based on counts
                        let bgStyle = "bg-indigo-900/5 dark:bg-indigo-950/20 text-gray-300 dark:text-slate-650";
                        if (count > 0 && count <= 2) {
                          bgStyle = "bg-indigo-500/20 border border-indigo-500/30 text-indigo-400";
                        } else if (count > 2 && count <= 5) {
                          bgStyle = "bg-indigo-500/50 border border-indigo-400/40 text-indigo-200";
                        } else if (count > 5) {
                          bgStyle = "bg-indigo-600 border border-indigo-300/55 text-white font-extrabold shadow-sm";
                        }

                        return (
                          <div 
                            key={blockIdx}
                            onMouseEnter={(e) => setHoveredHeatmap({ day: dayName, block: hourBlocks[blockIdx], count, x: e.clientX, y: e.clientY })}
                            onMouseLeave={() => setHoveredHeatmap(null)}
                            className={`h-9 rounded-lg flex items-center justify-center text-xs font-semibold cursor-pointer transition ${bgStyle} hover:scale-105 hover:ring-2 hover:ring-indigo-400`}
                          >
                            {count}
                          </div>
                        );
                      })}
                    </>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Heatmap Tooltip */}
          {hoveredHeatmap && (
            <div 
              className="fixed bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 shadow-2xl text-xs z-50 pointer-events-none"
              style={{ left: `${hoveredHeatmap.x + 15}px`, top: `${hoveredHeatmap.y - 15}px` }}
            >
              <p className="font-bold text-indigo-300">{hoveredHeatmap.day}</p>
              <p className="text-gray-400">Period: <span className="text-white font-medium">{hoveredHeatmap.block}</span></p>
              <p className="text-gray-400 mt-1">Completions: <span className="text-emerald-400 font-bold">{hoveredHeatmap.count}</span></p>
            </div>
          )}
        </div>

        {/* Engineer Rankings */}
        <div className="rounded-2xl border border-light-border bg-light-card p-6 shadow-sm dark:border-dark-border dark:bg-dark-card">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-light-text dark:text-dark-text">Engineer Rankings</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ranked by performance score (Completed rate, customer rating, and approval rate)</p>
            </div>

            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search engineer by name or ID..."
                className="w-full rounded-xl border border-light-border bg-light-bg pl-10 pr-4 py-2.5 text-sm text-light-text outline-none focus:ring-2 focus:ring-indigo-500 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
              />
              <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-gray-400" />
            </div>
          </div>

          {filteredRankings.length === 0 ? (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
              No engineers found matching your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="border-b border-light-border text-xs font-semibold uppercase tracking-wider text-gray-400 dark:border-dark-border">
                  <tr>
                    <th className="py-4 pl-4 text-center">Rank</th>
                    <th className="py-4">Engineer</th>
                    <th className="py-4 text-center">Tasks Assigned</th>
                    <th className="py-4 text-center">Tasks Completed</th>
                    <th className="py-4 text-center">Avg. Completion Time</th>
                    <th className="py-4 text-center">Avg. Review Time</th>
                    <th className="py-4 text-center">Approval Rate</th>
                    <th className="py-4 text-center">Rating</th>
                    <th className="py-4 text-center">Performance Score</th>
                    <th className="py-4 pr-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-border dark:divide-dark-border">
                  {filteredRankings.map((eng, idx) => {
                    // Determine trophy or index styling
                    let rankBg = "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-350";
                    let rankEmoji = null;
                    if (idx === 0) {
                      rankBg = "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 font-extrabold";
                      rankEmoji = "👑";
                    } else if (idx === 1) {
                      rankBg = "bg-slate-200 text-slate-800 dark:bg-slate-300/20 dark:text-slate-300 font-bold";
                    } else if (idx === 2) {
                      rankBg = "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400";
                    }

                    return (
                      <tr 
                        key={eng.engineerId}
                        onClick={() => setSelectedEngineer(eng)}
                        className="group hover:bg-gray-50 dark:hover:bg-slate-850 cursor-pointer transition"
                      >
                        <td className="py-4 pl-4 text-center">
                          <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs ${rankBg}`}>
                            {rankEmoji ? rankEmoji : idx + 1}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-indigo-500/10 flex items-center justify-center text-sm font-bold text-indigo-600 dark:text-indigo-400">
                              {eng.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-light-text dark:text-dark-text group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                {eng.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{eng.rollNumber || "ID: N/A"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-center font-semibold">{eng.tasksAssigned}</td>
                        <td className="py-4 text-center text-emerald-600 dark:text-emerald-400 font-semibold">{eng.tasksCompleted}</td>
                        <td className="py-4 text-center font-mono">{formatDuration(eng.avgCompletionTime)}</td>
                        <td className="py-4 text-center font-mono">{formatDuration(eng.avgReviewTime)}</td>
                        <td className="py-4 text-center">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            eng.approvalRate >= 80 
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : eng.approvalRate >= 50 
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                : "bg-red-500/10 text-red-600 dark:text-red-400"
                          }`}>
                            {eng.approvalRate}%
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-current text-amber-400" />
                            <span className="font-semibold">{eng.avgRating || "0.0"}</span>
                          </div>
                        </td>
                        <td className="py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* Visual mini-bar inside rankings */}
                            <div className="w-16 bg-gray-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden hidden sm:block">
                              <div 
                                className="bg-indigo-600 h-full rounded-full" 
                                style={{ width: `${eng.performanceScore}%` }}
                              ></div>
                            </div>
                            <span className="font-extrabold text-light-text dark:text-dark-text font-mono">
                              {eng.performanceScore}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 pr-4 text-right">
                          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-transform duration-250 group-hover:translate-x-1" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Individual Profile Overlay Drawer */}
        {selectedEngineer && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity duration-300">
            {/* Drawer Overlay backdrop closer */}
            <div className="absolute inset-0" onClick={() => setSelectedEngineer(null)}></div>
            
            {/* Drawer Content */}
            <div className="relative w-full max-w-lg bg-light-bg dark:bg-dark-bg h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between border-l border-light-border dark:border-dark-border animate-slide-in">
              <div>
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-6 border-b border-light-border dark:border-dark-border">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full border border-indigo-500/30 overflow-hidden bg-indigo-600/10 flex items-center justify-center text-lg font-bold text-indigo-600 dark:text-indigo-400">
                      {selectedEngineer.photo ? (
                        <img 
                          src={selectedEngineer.photo.startsWith("http") ? selectedEngineer.photo : `http://localhost:5001/${selectedEngineer.photo}`} 
                          alt={selectedEngineer.name} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        selectedEngineer.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-light-text dark:text-dark-text leading-tight">{selectedEngineer.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-gray-500 font-mono">{selectedEngineer.rollNumber || "ID: N/A"}</span>
                        <span className="text-gray-400 text-[10px]">•</span>
                        <div className="flex items-center gap-1">
                          <span className={`h-2 w-2 rounded-full ${
                            selectedEngineer.availability === "available" 
                              ? "bg-emerald-500 animate-pulse" 
                              : selectedEngineer.availability === "busy" 
                              ? "bg-amber-500" 
                              : "bg-rose-500"
                          }`}></span>
                          <span className="text-[9px] uppercase font-bold text-gray-500">
                            {selectedEngineer.availability}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedEngineer(null)}
                    className="p-1.5 rounded-xl border border-light-border bg-light-card hover:bg-gray-100 dark:border-dark-border dark:bg-dark-card dark:hover:bg-slate-800 transition"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                {/* Details Section */}
                <div className="py-6 space-y-5">
                  {/* Contact Cards */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-900 rounded-xl">
                      <Phone className="h-4 w-4 text-indigo-500" />
                      <div>
                        <p className="text-gray-400">Phone</p>
                        <p className="font-semibold text-light-text dark:text-dark-text">{selectedEngineer.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-900 rounded-xl">
                      <Mail className="h-4 w-4 text-indigo-500" />
                      <div className="truncate">
                        <p className="text-gray-400">Email</p>
                        <p className="font-semibold text-light-text dark:text-dark-text truncate">{selectedEngineer.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-900 rounded-xl col-span-2">
                      <MapPin className="h-4 w-4 text-indigo-500" />
                      <div>
                        <p className="text-gray-400">Location/City</p>
                        <p className="font-semibold text-light-text dark:text-dark-text">{selectedEngineer.city}</p>
                      </div>
                    </div>
                  </div>

                  {/* Skills Grid */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Expertise & Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedEngineer.skills && selectedEngineer.skills.length > 0 ? (
                        selectedEngineer.skills.map((skill, idx) => (
                          <span 
                            key={idx} 
                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 dark:text-indigo-300"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500 italic">No skills registered.</span>
                      )}
                    </div>
                  </div>

                  {/* Profile Parameters */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 dark:bg-slate-900 p-4 rounded-xl">
                    <div>
                      <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider mb-0.5">Department</p>
                      <p className="font-semibold text-light-text dark:text-dark-text">{selectedEngineer.department || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-450 font-bold uppercase text-[9px] tracking-wider mb-0.5">Work Mode</p>
                      <p className="font-semibold text-light-text dark:text-dark-text uppercase">{selectedEngineer.workMode || "Field"}</p>
                    </div>
                    <div>
                      <p className="text-gray-450 font-bold uppercase text-[9px] tracking-wider mb-0.5">Experience</p>
                      <p className="font-semibold text-light-text dark:text-dark-text">{selectedEngineer.experience || 0} Years</p>
                    </div>
                    <div>
                      <p className="text-gray-450 font-bold uppercase text-[9px] tracking-wider mb-0.5">Customer Rating</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="font-bold text-light-text dark:text-dark-text">{selectedEngineer.avgRating || 0}</span>
                        <span className="text-amber-505 text-xs">★</span>
                      </div>
                    </div>
                  </div>

                  {/* Core Personal Stats */}
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider pt-2">Performance Indices</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-light-border dark:border-dark-border p-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Tasks Completed / Assigned</p>
                      <p className="text-2xl font-bold mt-1 text-light-text dark:text-dark-text">
                        {selectedEngineer.tasksCompleted} <span className="text-xs text-gray-400">/ {selectedEngineer.tasksAssigned}</span>
                      </p>
                    </div>
                    <div className="rounded-xl border border-light-border dark:border-dark-border p-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Performance Score</p>
                      <p className="text-2xl font-extrabold mt-1 text-indigo-600 dark:text-indigo-400">
                        {selectedEngineer.performanceScore} <span className="text-xs font-normal text-gray-400">/ 100</span>
                      </p>
                    </div>
                    <div className="rounded-xl border border-light-border dark:border-dark-border p-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Avg. Completion Time</p>
                      <p className="text-lg font-bold mt-1 font-mono text-light-text dark:text-dark-text">
                        {formatDuration(selectedEngineer.avgCompletionTime)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-light-border dark:border-dark-border p-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Approval Rate</p>
                      <p className="text-lg font-bold mt-1 text-light-text dark:text-dark-text">
                        {selectedEngineer.approvalRate}%
                      </p>
                    </div>
                  </div>

                  {/* Office vs Field breakdown */}
                  <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-xl space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-gray-500 dark:text-gray-400">Task Mode Splits</span>
                      <span className="font-semibold text-rose-500">{selectedEngineer.delayedTasks} Delayed</span>
                    </div>
                    <div className="flex h-3 rounded-full bg-gray-200 dark:bg-slate-800 overflow-hidden">
                      <div className="bg-indigo-500" style={{ width: `${(selectedEngineer.officeTasks / (selectedEngineer.officeTasks + selectedEngineer.fieldTasks || 1)) * 100}%` }}></div>
                      <div className="bg-sky-400" style={{ width: `${(selectedEngineer.fieldTasks / (selectedEngineer.officeTasks + selectedEngineer.fieldTasks || 1)) * 100}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-400">
                      <span>Office: {selectedEngineer.officeTasks} tasks ({Math.round((selectedEngineer.officeTasks / (selectedEngineer.officeTasks + selectedEngineer.fieldTasks || 1)) * 100)}%)</span>
                      <span>Field: {selectedEngineer.fieldTasks} tasks ({Math.round((selectedEngineer.fieldTasks / (selectedEngineer.officeTasks + selectedEngineer.fieldTasks || 1)) * 100)}%)</span>
                    </div>
                  </div>

                  {/* Monthly Output Trend */}
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider pt-2">Monthly History (Completed Tasks)</h4>
                  <div className="h-32 flex items-end justify-between gap-2 px-4 pb-2 pt-6 border border-light-border dark:border-dark-border rounded-xl">
                    {selectedEngineer.monthlyPerformance.map((item, idx) => {
                      const maxComp = Math.max(...selectedEngineer.monthlyPerformance.map(m => m.completed), 1);
                      const heightPercent = (item.completed / maxComp) * 100;
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group/bar">
                          {/* Hover tooltip for individual months */}
                          <div className="hidden group-hover/bar:block bg-slate-950 border border-slate-700 text-white rounded text-[10px] py-0.5 px-1.5 absolute -translate-y-9 shadow-lg">
                            {item.completed} completed
                          </div>
                          <div 
                            className="w-full bg-indigo-500/20 group-hover/bar:bg-indigo-500 rounded-md transition duration-150" 
                            style={{ height: `${Math.max(heightPercent, 5)}%` }}
                          ></div>
                          <span className="text-[10px] text-gray-400 font-semibold">{item.month}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Projects Split */}
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Project Involvements</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 border border-light-border dark:border-dark-border rounded-xl bg-gray-50 dark:bg-slate-900/40 space-y-1.5">
                        <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Current Projects</span>
                        {selectedEngineer.currentProjects && selectedEngineer.currentProjects.length > 0 ? (
                          <ul className="text-xs space-y-1 text-light-text dark:text-dark-text font-medium list-disc pl-4">
                            {selectedEngineer.currentProjects.map((p, idx) => (
                              <li key={idx}>{p}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-xs text-slate-500 italic block">No active projects</span>
                        )}
                      </div>

                      <div className="p-3 border border-light-border dark:border-dark-border rounded-xl bg-gray-50 dark:bg-slate-900/40 space-y-1.5">
                        <span className="text-[10px] font-black uppercase text-emerald-450 tracking-wider">Completed Projects</span>
                        {selectedEngineer.completedProjects && selectedEngineer.completedProjects.length > 0 ? (
                          <ul className="text-xs space-y-1 text-light-text dark:text-dark-text font-medium list-disc pl-4">
                            {selectedEngineer.completedProjects.map((p, idx) => (
                              <li key={idx}>{p}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-xs text-slate-500 italic block">No completed projects</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Close Drawer Button */}
              {/* Drawer Actions */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  onClick={() => setSelectedEngineer(null)}
                  className="w-full bg-slate-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white py-3 rounded-xl font-semibold transition cursor-pointer"
                >
                  Close Drawer
                </button>
                <button
                  onClick={() => handleRevokeAccess(selectedEngineer._id)}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>⚠️ Revoke Access</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
