import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Printer,
  Copy,
  Check,
  Calculator,
  Plus,
  Trash2,
  Receipt,
  Building2,
  Sparkles,
  Share2
} from "lucide-react";

export default function QuotationModal({ task, isOpen, onClose }) {
  const [items, setItems] = useState([]);
  const [laborCharge, setLaborCharge] = useState(5000);
  const [gstRate, setGstRate] = useState(18); // 18% GST
  const [discount, setDiscount] = useState(0);
  const [validDays, setValidDays] = useState(30);
  const [copied, setCopied] = useState(false);
  const reportRef = useRef(null);

  // Pre-fill materials from task as line items with default rates
  useEffect(() => {
    if (!task) return;

    const materials = task.materials || [];
    if (materials.length > 0) {
      const mapped = materials.map((m, idx) => ({
        id: `mat_${idx}_${Date.now()}`,
        name: m.name,
        qty: Number(m.qty) || 1,
        unit: m.unit || "pcs",
        rate: 850, // default placeholder unit price
        remarks: m.remarks || "Supplied & Installed",
      }));
      setItems(mapped);
    } else {
      setItems([
        {
          id: "item_1",
          name: "Site Structural Inspection & Soil Assessment",
          qty: 1,
          unit: "visit",
          rate: 4500,
          remarks: "On-site GPS technical inspection",
        },
        {
          id: "item_2",
          name: "Reinforced Concrete Quality Verification",
          qty: 1,
          unit: "lot",
          rate: 6000,
          remarks: "Structural load integrity check",
        },
      ]);
    }
  }, [task]);

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

  const quoteId = `QTN-${(task._id || "").slice(-6).toUpperCase()}-${new Date().getFullYear()}`;
  const quoteDate = new Date().toLocaleDateString("en-IN");
  const expiryDate = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN");

  // Cost calculations
  const materialsSubtotal = items.reduce((sum, item) => sum + (Number(item.qty) || 0) * (Number(item.rate) || 0), 0);
  const grossTotal = materialsSubtotal + Number(laborCharge || 0);
  const discountedTotal = Math.max(0, grossTotal - Number(discount || 0));
  const gstAmount = Math.round((discountedTotal * Number(gstRate || 0)) / 100);
  const grandTotal = discountedTotal + gstAmount;

  const formatINR = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item_${Date.now()}`,
        name: "Additional Structural Work / Material",
        qty: 1,
        unit: "units",
        rate: 1000,
        remarks: "Specified as per structural drawing",
      },
    ]);
  };

  const handleUpdateItem = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyWhatsAppQuote = () => {
    const text = `🏗️ *MAARAN Engineers & Consultancy*
📋 *Official Engineering Quotation: ${quoteId}*
📅 *Date:* ${quoteDate} (Valid for ${validDays} days)

*Client:* ${task.customerName || "Valued Client"}
*Project / Task:* ${task.title || "Consultancy Project"}
*Site Location:* ${task.siteAddress || "Field Site"}

*Bill of Quantities / Scope of Work:*
${items.map((it, idx) => `${idx + 1}. *${it.name}* — ${it.qty} ${it.unit} @ ${formatINR(it.rate)} = ${formatINR(it.qty * it.rate)}`).join("\n")}

*Summary of Charges:*
 • Materials / Parts Subtotal: ${formatINR(materialsSubtotal)}
 • Engineering / Labor Fee: ${formatINR(laborCharge)}
${discount > 0 ? ` • Discount: -${formatINR(discount)}\n` : ""} • GST (${gstRate}%): ${formatINR(gstAmount)}
━━━━━━━━━━━━━━━━━━━━
💰 *Grand Total Payable: ${formatINR(grandTotal)}*
━━━━━━━━━━━━━━━━━━━━

*Bank Transfer Details:*
Bank: HDFC Bank • A/C: 50200041234567 • IFSC: HDFC0001234
Account Name: MAARAN Engineers & Consultancy

_Generated via ConstructAI Enterprise ERP_`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quotation-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8 max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Top Header Toolbar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h3 id="quotation-modal-title" className="text-base font-black text-white">
                Commercial Quotation & Bill of Quantities (BOQ)
              </h3>
              <p className="text-[11px] font-mono text-slate-400">{quoteId} • {quoteDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyWhatsAppQuote}
              className="py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
              title="Copy formatted quotation for WhatsApp"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied!" : "WhatsApp Quote"}</span>
            </button>

            <button
              onClick={handlePrint}
              className="py-2 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              aria-label="Close quotation dialog"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Quotation Content */}
        <div ref={reportRef} className="overflow-y-auto py-6 space-y-6 pr-1 print:p-0 print:m-0 print:overflow-visible">
          
          {/* Printable Letterhead */}
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
                  <p className="text-[10px] text-slate-400">Civil • Structural Design • Valuation • Geo-Surveys</p>
                </div>
              </div>

              <div className="text-left sm:text-right font-mono text-xs">
                <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Quotation Ref</p>
                <p className="text-indigo-400 font-black text-sm">{quoteId}</p>
                <p className="text-slate-400 text-[10px] mt-0.5">Valid Until: {expiryDate}</p>
              </div>
            </div>

            {/* Client Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
              <div>
                <span className="text-slate-500 uppercase font-bold text-[10px] block">Prepared For</span>
                <span className="text-white font-bold text-sm block mt-0.5">{task.customerName || "Direct Client"}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase font-bold text-[10px] block">Project / Task</span>
                <span className="text-slate-200 font-semibold block mt-0.5">{task.title}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase font-bold text-[10px] block">Site Location</span>
                <span className="text-slate-200 font-semibold block mt-0.5 truncate">{task.siteAddress || "Field Site"}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase font-bold text-[10px] block">Contact Phone</span>
                <span className="text-indigo-300 font-mono font-bold block mt-0.5">{task.phoneNumber || "Direct Dispatch"}</span>
              </div>
            </div>
          </div>

          {/* Bill of Quantities Items Table */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white uppercase tracking-wider text-xs flex items-center gap-2">
                <Calculator className="h-4 w-4 text-indigo-400" />
                <span>Scope of Work & Materials Allocation</span>
              </h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-2.5 py-1 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/30 text-xs font-bold transition flex items-center gap-1 cursor-pointer print:hidden"
              >
                <Plus className="h-3 w-3" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider text-[10px]">
                    <th className="pb-2">Description / Material</th>
                    <th className="pb-2 px-2 text-center w-20">Qty</th>
                    <th className="pb-2 px-2 text-center w-24">Unit</th>
                    <th className="pb-2 px-3 text-right w-28">Unit Rate (₹)</th>
                    <th className="pb-2 px-3 text-right w-28">Amount (₹)</th>
                    <th className="pb-2 text-right w-10 print:hidden"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/40">
                      <td className="py-2.5 pr-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleUpdateItem(item.id, "name", e.target.value)}
                          className="w-full bg-transparent text-slate-200 font-semibold focus:outline-none focus:bg-slate-900/80 rounded px-1.5 py-0.5 border border-transparent focus:border-slate-700"
                        />
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(e) => handleUpdateItem(item.id, "qty", Number(e.target.value))}
                          className="w-16 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-center text-indigo-400 font-mono font-bold focus:outline-none focus:border-indigo-500"
                        />
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => handleUpdateItem(item.id, "unit", e.target.value)}
                          className="w-20 bg-transparent text-slate-400 text-center text-[11px] focus:outline-none focus:bg-slate-900 rounded px-1"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => handleUpdateItem(item.id, "rate", Number(e.target.value))}
                          className="w-24 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-right text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                        {formatINR((Number(item.qty) || 0) * (Number(item.rate) || 0))}
                      </td>
                      <td className="py-2.5 text-right print:hidden">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-slate-500 hover:text-rose-400 transition p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Adjustments & Grand Total Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Payment & Banking Terms */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 space-y-2">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Payment Terms & Banking</span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                • 50% mobilization advance upon quotation acceptance.
                <br />
                • 50% upon final structural report delivery & sign-off.
              </p>
              <div className="pt-2 border-t border-slate-850 font-mono text-[10px] text-slate-400">
                <p><span className="text-slate-500">Bank:</span> HDFC Bank (Chennai Branch)</p>
                <p><span className="text-slate-500">A/C:</span> 50200041234567 • <span className="text-slate-500">IFSC:</span> HDFC0001234</p>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 space-y-2.5 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Materials Subtotal:</span>
                <span className="text-white font-bold">{formatINR(materialsSubtotal)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-400">
                <span>Engineering & Labor Fee:</span>
                <input
                  type="number"
                  value={laborCharge}
                  onChange={(e) => setLaborCharge(Number(e.target.value))}
                  className="w-24 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-right text-white font-mono"
                />
              </div>

              <div className="flex justify-between items-center text-slate-400">
                <span>GST Tax Rate (%):</span>
                <input
                  type="number"
                  value={gstRate}
                  onChange={(e) => setGstRate(Number(e.target.value))}
                  className="w-16 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-right text-white font-mono"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-black">
                <span className="text-slate-200">Grand Total Payable:</span>
                <span className="text-emerald-400 text-base">{formatINR(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-slate-800/60">
            <p>MAARAN Engineers & Consultancy • Official Quotation • support: maaranengineers2016@gmail.com</p>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
