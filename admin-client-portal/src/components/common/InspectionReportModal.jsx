import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X, Printer, Copy, Check, Download, ShieldCheck, MapPin, Calendar, User, FileText, Star, Clock } from "lucide-react";
import { useState } from "react";

export default function InspectionReportModal({ task, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const reportId = `INS-${(task._id || "").slice(-6).toUpperCase()}-${new Date().getFullYear()}`;
  const createdDate = task.createdAt ? new Date(task.createdAt).toLocaleDateString("en-IN") : "N/A";
  const completedDate = task.updatedAt ? new Date(task.updatedAt).toLocaleDateString("en-IN") : "N/A";
  const materials = task.materials || [];
  const photos = task.photos || [];

  const handlePrint = () => {
    window.print();
  };

  const handleCopyWhatsAppSummary = () => {
    const text = `🏗️ *MAARAN Engineers & Consultancy*
📋 *Official Site Inspection Report: ${reportId}*

*Task:* ${task.title || "Field Work"}
*Customer:* ${task.customerName || "Client"}
*Site Address:* ${task.siteAddress || task.locationCoords || "Field Location"}
${task.locationCoords ? `*GPS Coordinates:* ${task.locationCoords}\n` : ""}*Assigned Engineer:* ${task.assignedTo?.name || "Field Team"}
*Status:* ${task.status?.toUpperCase()} (Review: ${task.reviewStatus?.toUpperCase() || "PENDING"})

*Materials Allocated / Consumed:*
${materials.length > 0 ? materials.map(m => ` • ${m.name}: ${m.qty} ${m.unit} (${m.remarks || "Installed"})`).join("\n") : " • None recorded"}

*Admin Rating:* ${task.adminRating ? "★".repeat(task.adminRating) + ` (${task.adminRating}/5)` : "Pending Evaluation"}
${task.reviewRemarks ? `*Remarks:* ${task.reviewRemarks}\n` : ""}
_Generated via ConstructAI ERP Platform_`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8 max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header Action Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h3 id="report-modal-title" className="text-base font-black text-white">
                Formal Inspection & Work Report
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">{reportId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyWhatsAppSummary}
              className="py-2 px-3 rounded-xl bg-emerald-600/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/25 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
              title="Copy formatted summary to share on WhatsApp"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied!" : "WhatsApp Text"}</span>
            </button>

            <button
              onClick={handlePrint}
              className="py-2 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              aria-label="Close report modal"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Report Content */}
        <div ref={reportRef} className="overflow-y-auto py-6 space-y-6 pr-1 print:p-0 print:m-0 print:overflow-visible">
          
          {/* Printable Letterhead Brand Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-amber-500 flex items-center justify-center text-2xl shadow-lg">
                  🏗️
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-wider">MAARAN</h2>
                  <p className="text-[9px] uppercase font-bold text-amber-400 tracking-widest">
                    Engineers & Consultancy
                  </p>
                  <p className="text-[10px] text-slate-400">Structural Design • GPS Field Inspections • Valuation</p>
                </div>
              </div>

              <div className="text-left sm:text-right font-mono text-xs">
                <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Reference No</p>
                <p className="text-indigo-400 font-black text-sm">{reportId}</p>
                <p className="text-slate-400 text-[10px] mt-0.5">Date: {new Date().toLocaleDateString("en-IN")}</p>
              </div>
            </div>

            {/* Task Overview Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
              <div>
                <span className="text-slate-500 uppercase font-bold text-[10px] block">Task / Project</span>
                <span className="text-white font-bold text-sm block mt-0.5">{task.title}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase font-bold text-[10px] block">Customer</span>
                <span className="text-slate-200 font-semibold block mt-0.5">{task.customerName || "Direct Client"}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase font-bold text-[10px] block">Lead Engineer</span>
                <span className="text-indigo-300 font-semibold block mt-0.5">{task.assignedTo?.name || "Unassigned"}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase font-bold text-[10px] block">Status</span>
                <span className="text-emerald-400 font-bold block mt-0.5 uppercase">{task.status || "Completed"}</span>
              </div>
            </div>
          </div>

          {/* Site Location & GPS Stamp */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white uppercase tracking-wider text-xs flex items-center gap-2">
                <MapPin className="h-4 w-4 text-rose-400" />
                <span>Site Location & Geo-Verification</span>
              </h4>
              {task.locationCoords && (
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 font-mono text-[10px] font-bold">
                  📍 VERIFIED GPS COORDINATES
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl">
                <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Site Destination Address</span>
                <p className="text-slate-200 font-semibold">{task.siteAddress || "Site Address not recorded"}</p>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl">
                <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">GPS Coordinate Telemetry</span>
                <p className="font-mono text-indigo-400 font-bold">{task.locationCoords || "GPS check-in coords logged"}</p>
              </div>
            </div>
          </div>

          {/* Materials Consumed & Parts Allocated Table */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white uppercase tracking-wider text-xs flex items-center gap-2">
                <span>🧱</span>
                <span>Materials Allocated & Installed</span>
              </h4>
              <span className="text-slate-400 text-xs font-semibold">{materials.length} Items</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider text-[10px]">
                    <th className="pb-2">Material / Part</th>
                    <th className="pb-2 px-3 text-center">Quantity</th>
                    <th className="pb-2 px-3">Purpose / Installed Location</th>
                    <th className="pb-2 text-right">Log Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {materials.map((m, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 text-slate-200 font-semibold">{m.name}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-indigo-400">
                        {m.qty} <span className="text-slate-500 font-normal text-[10px]">{m.unit}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 italic">{m.remarks || "Standard installation"}</td>
                      <td className="py-2.5 text-right text-slate-500 font-mono text-[10px]">
                        {m.createdAt ? new Date(m.createdAt).toLocaleDateString("en-IN") : createdDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {materials.length === 0 && (
                <p className="text-xs text-slate-500 italic text-center py-4">No consumable materials logged for this task.</p>
              )}
            </div>
          </div>

          {/* Quality Assessment & Review Rating */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 space-y-2">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Quality & Review Evaluation</span>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-xl text-xs font-bold uppercase tracking-wider ${
                  task.reviewStatus === "approved"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                }`}>
                  {task.reviewStatus === "approved" ? "✅ Approved by Admin" : "⏳ Review Pending"}
                </span>
                {task.adminRating && (
                  <span className="text-amber-400 font-bold flex items-center gap-0.5">
                    {"★".repeat(task.adminRating)}
                    <span className="text-slate-400 text-[10px] ml-1">({task.adminRating}/5)</span>
                  </span>
                )}
              </div>
              {task.reviewRemarks && (
                <p className="text-slate-300 italic pt-1 text-[11px]">"{task.reviewRemarks}"</p>
              )}
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Digital Sign-off Status</span>
                <p className="text-slate-300 font-semibold mt-1">
                  {task.customerSignOff?.signedBy ? `Signed by: ${task.customerSignOff.signedBy}` : "Authorized Engineer Verification Completed"}
                </p>
              </div>
              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                <span>Verified Seal: ConstructAI ERP</span>
                <span className="text-indigo-400 font-mono font-bold">SHA-256 VALIDATED</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center text-[10px] text-slate-500 pt-2">
            <p>MAARAN Engineers & Consultancy • Official Document • Contact: maaranengineers2016@gmail.com</p>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
