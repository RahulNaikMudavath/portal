import { useState, useEffect, useMemo } from "react";
import ClientLayout from "../../layouts/ClientLayout";
import { getTasks } from "../../services/taskService";
import { getProjects } from "../../services/projectService";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, CheckCircle, Clock, AlertTriangle, 
  Search, Eye, Calendar, MapPin, MessageSquare, ExternalLink, X 
} from "lucide-react";

export default function Submissions() {
  const [tasks, setTasks] = useState([]);
  const [projectMap, setProjectMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSub, setSelectedSub] = useState(null);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError("");
      const [tasksRes, projectsRes] = await Promise.all([
        getTasks(),
        getProjects()
      ]);

      // Submissions are tasks that are completed, under review, or have been reviewed
      const allTasks = tasksRes.data || [];
      const submissions = allTasks.filter(t => t.submittedAt || t.status === "completed" || t.reviewStatus);
      setTasks(submissions);

      // Build task-to-project mapping
      const mapping = {};
      (projectsRes.data || []).forEach(p => {
        (p.tasks || []).forEach(t => {
          const tId = typeof t === "string" ? t : t._id;
          mapping[tId] = p.name;
        });
      });
      setProjectMap(mapping);
    } catch (err) {
      console.error("Fetch submissions error:", err);
      setError("Failed to load submissions. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Filter submissions by search query
  const filteredSubmissions = useMemo(() => {
    return tasks.filter(t => 
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.rollNumber && t.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [tasks, searchTerm]);

  // Calculations for KPI Cards
  const stats = useMemo(() => {
    const total = tasks.length;
    const approved = tasks.filter(t => t.reviewStatus === "approved").length;
    const pending = tasks.filter(t => t.reviewStatus === "pending" || (!t.reviewStatus && t.status === "completed")).length;
    const rejected = tasks.filter(t => t.reviewStatus === "rejected").length;
    const rate = total > 0 ? Math.round((approved / total) * 100) : 0;

    return { total, approved, pending, rejected, rate };
  }, [tasks]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Helper to extract admin feedback from activity log
  const getAdminFeedback = (task) => {
    if (!task.activityLog) return "";
    const logs = [...task.activityLog].reverse();
    const reviewLog = logs.find(l => 
      l.action === "Task Approved" || 
      l.action === "Task Rejected" || 
      l.action === "Rework Requested" || 
      l.action === "Returned with Comments"
    );
    return reviewLog ? reviewLog.remarks : "";
  };

  return (
    <ClientLayout>
      <div className="space-y-6 pb-10">
        
        {/* Top Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Submissions History</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review and monitor evaluations for your submitted on-site inspections, photos, and signatures.
            </p>
          </div>
          <button
            onClick={fetchSubmissions}
            className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs"
          >
            Refresh List
          </button>
        </div>

        {/* Loading/Error States */}
        {loading ? (
          <div className="h-[45vh] flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto"></div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold font-sans">Loading submissions log...</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-400">
            <AlertTriangle className="h-10 w-10 mx-auto mb-2" />
            <h3 className="font-bold text-sm font-sans">Failed to Load</h3>
            <p className="text-xs mt-1 text-slate-500 dark:text-slate-400 font-sans">{error}</p>
          </div>
        ) : (
          <>
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider font-sans">Total Submissions</span>
                  <span className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <FileText className="h-4.5 w-4.5" />
                  </span>
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-bold text-slate-800 dark:text-white">{stats.total}</span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-1 font-sans">Inspections logged in database</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider font-sans">Approved Tasks</span>
                  <span className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 rounded-lg">
                    <CheckCircle className="h-4.5 w-4.5" />
                  </span>
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-bold text-slate-800 dark:text-white">{stats.approved}</span>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-sans">Approval Ratio: {stats.rate}%</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider font-sans">Pending Evaluation</span>
                  <span className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-amber-600 dark:text-amber-400 rounded-lg">
                    <Clock className="h-4.5 w-4.5" />
                  </span>
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-bold text-slate-800 dark:text-white">{stats.pending}</span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-1 font-sans">Waiting for administrator audit</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider font-sans">Rework Needed</span>
                  <span className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-rose-600 dark:text-rose-400 rounded-lg">
                    <AlertTriangle className="h-4.5 w-4.5" />
                  </span>
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-bold text-slate-800 dark:text-white">{stats.rejected}</span>
                  <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-1 font-sans">Requires revision/re-inspection</p>
                </div>
              </div>

            </div>

            {/* List & Filters Column */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl transition-colors duration-300">
              
              {/* Search Bar header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-850 flex flex-col sm:flex-row gap-3 sm:items-center justify-between bg-slate-50/50 dark:bg-slate-900/60">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-sans">Submissions Registry</span>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search submissions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              {/* Table list */}
              {filteredSubmissions.length === 0 ? (
                <div className="p-12 text-center text-slate-400 dark:text-slate-500 italic text-xs font-sans">
                  No submissions found matching the query.
                </div>
              ) : (
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-955/20 text-slate-500 dark:text-slate-400 font-bold font-sans">
                        <th className="p-4">Inspection Title</th>
                        <th className="p-4">Project</th>
                        <th className="p-4">Submitted Date</th>
                        <th className="p-4">Review Status</th>
                        <th className="p-4">Admin Remarks</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-300">
                      {filteredSubmissions.map((sub) => {
                        const feedback = getAdminFeedback(sub);
                        const status = sub.reviewStatus || "pending";
                        
                        return (
                          <tr key={sub._id} className="hover:bg-slate-50 dark:hover:bg-slate-850/40 transition">
                            <td className="p-4 font-bold text-slate-800 dark:text-white max-w-[200px] truncate">{sub.title}</td>
                            <td className="p-4 text-slate-500 dark:text-slate-400">{projectMap[sub._id] || "Standalone Task"}</td>
                            <td className="p-4 text-slate-500 dark:text-slate-450 font-mono">{formatDate(sub.submittedAt)}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                status === "approved"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                  : status === "rejected"
                                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                                  : "bg-amber-500/10 text-amber-600 dark:text-amber-450 border border-amber-500/20"
                              }`}>
                                {status === "approved" ? "Approved" : status === "rejected" ? "Rework" : "Under Review"}
                              </span>
                            </td>
                            <td className="p-4 max-w-[250px] truncate text-slate-500 dark:text-slate-450 font-sans">
                              {feedback ? (
                                <span className={status === "rejected" ? "text-rose-550 dark:text-rose-450 font-medium" : ""}>
                                  {feedback}
                                </span>
                              ) : (
                                <span className="text-slate-400 dark:text-slate-650 italic">No notes logged</span>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => setSelectedSub(sub)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-600/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-650 transition cursor-pointer font-bold"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>Inspect</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Submission Detail Modal overlay */}
      <AnimatePresence>
        {selectedSub && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-6 z-50 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.97, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.97, y: 15 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-6 text-xs text-slate-600 dark:text-slate-350 max-h-[85vh] overflow-y-auto"
            >
              
              <button 
                onClick={() => setSelectedSub(null)}
                className="absolute top-4 right-4 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-450 cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              {/* Header */}
              <div className="border-b border-slate-200 dark:border-slate-800/80 pb-4 space-y-1.5">
                <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">Submission Detail</span>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">{selectedSub.title}</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-455">
                  Project Scope: <span className="font-semibold text-slate-700 dark:text-slate-300">{projectMap[selectedSub._id] || "Standalone Task"}</span>
                </p>
              </div>

              {/* Status block */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl">
                <div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mb-0.5 font-sans">Evaluation Status</p>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1 ${
                    selectedSub.reviewStatus === "approved"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : selectedSub.reviewStatus === "rejected"
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-450 border border-amber-500/20"
                  }`}>
                    {selectedSub.reviewStatus === "approved" ? "Approved" : selectedSub.reviewStatus === "rejected" ? "Rework Required" : "Under Review"}
                  </span>
                </div>

                <div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mb-1 font-sans">Date Submitted</p>
                  <span className="font-mono text-slate-800 dark:text-white text-[11px] flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400 dark:text-slate-455" /> {formatDate(selectedSub.submittedAt)}
                  </span>
                </div>
              </div>

              {/* Checklists or details */}
              <div className="space-y-4">
                
                {/* Admin review notes */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1 font-sans">
                    <MessageSquare className="h-3.5 w-3.5" /> Evaluator Feedback
                  </h4>
                  <div className="bg-slate-50 dark:bg-slate-955/20 border border-slate-200 dark:border-slate-850 p-4 rounded-xl">
                    {getAdminFeedback(selectedSub) ? (
                      <p className={selectedSub.reviewStatus === "rejected" ? "text-rose-600 dark:text-rose-450 font-medium" : "text-slate-800 dark:text-slate-300"}>
                        {getAdminFeedback(selectedSub)}
                      </p>
                    ) : (
                      <p className="text-slate-400 dark:text-slate-550 italic font-sans">No notes logged by administrator.</p>
                    )}
                  </div>
                </div>

                {/* Submissions Attachments */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-sans">Inspection Attachments</h4>
                  {selectedSub.submissionFiles && selectedSub.submissionFiles.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {selectedSub.submissionFiles.map((file, idx) => (
                        <a
                          key={idx}
                          href={file}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955/30 hover:border-indigo-500/50 hover:bg-slate-100 dark:hover:bg-slate-955/70 transition"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-lg">🖼️</span>
                            <span className="truncate text-slate-700 dark:text-slate-300 font-bold">Photo Attachment {idx + 1}</span>
                          </div>
                          <ExternalLink className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-550 italic block font-sans">No photos uploaded during submission</span>
                  )}
                </div>

                {/* GPS coords check in log */}
                {selectedSub.locationCoords && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-sans">GPS Audit Coordinates</h4>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${selectedSub.locationCoords}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-955/20 border border-slate-200 dark:border-slate-850 rounded-xl hover:border-indigo-500/50 transition"
                    >
                      <MapPin className="h-4 w-4 text-indigo-650 dark:text-indigo-400" />
                      <span className="font-mono text-slate-700 dark:text-slate-300 font-bold truncate">{selectedSub.locationCoords}</span>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                    </a>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex justify-end">
                <button
                  onClick={() => setSelectedSub(null)}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl font-bold cursor-pointer transition"
                >
                  Close Inspection
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ClientLayout>
  );
}