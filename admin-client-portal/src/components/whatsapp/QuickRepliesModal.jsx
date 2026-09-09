import { useState } from "react";
import { Zap, Search, X, Check, Copy } from "lucide-react";

export const QUICK_TEMPLATES = [
  {
    id: "qtn",
    category: "Estimation",
    title: "💰 Official BOQ & Quotation",
    text: "Hi! Here is your official BOQ quotation and commercial estimation. Please review the breakdown and feel free to reach out if you have any questions.",
  },
  {
    id: "dispatch",
    category: "Site Visits",
    title: "🚗 Engineer En Route to Site",
    text: "Our senior civil engineer has been dispatched to your construction site. Estimated arrival time is 25-30 minutes.",
  },
  {
    id: "gps",
    category: "Site Visits",
    title: "📍 Request Site Location Pin",
    text: "Could you please share your site's exact Google Maps location pin along with the plot survey number?",
  },
  {
    id: "complete",
    category: "Documentation",
    title: "✅ Inspection Finished & Approved",
    text: "The structural site inspection has been completed successfully. All quality logs, test photos, and sign-offs are updated in our portal.",
  },
  {
    id: "payment",
    category: "Payments",
    title: "💳 Mobilization Advance Request",
    text: "Please proceed with the 50% mobilization advance via bank transfer to initiate next-stage site work: HDFC Bank A/C: 50200041234567 • IFSC: HDFC0001234.",
  },
  {
    id: "soil",
    category: "Documentation",
    title: "📐 Foundation & Structural Detailing",
    text: "Structural drawings and column reinforcement specifications have been finalized in accordance with IS 456 standards.",
  },
];

export default function QuickRepliesModal({ isOpen, onClose, onSelectTemplate }) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  if (!isOpen) return null;

  const categories = ["All", "Estimation", "Site Visits", "Documentation", "Payments"];

  const filtered = QUICK_TEMPLATES.filter((t) => {
    const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.text.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs"
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                WhatsApp Quick Responses
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                1-click construction message templates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search templates (e.g. quote, engineer, advance)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
            autoFocus
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Template List */}
        <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching templates found.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectTemplate(item.text);
                  onClose();
                }}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 hover:bg-indigo-50/50 dark:hover:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/40 transition cursor-pointer group space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {item.title}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-200/60 dark:bg-slate-750 px-2 py-0.5 rounded-md">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                  {item.text}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
