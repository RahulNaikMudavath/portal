import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Eye, EyeOff, Key, Copy, Check, ShieldCheck } from "lucide-react";
import { createEngineer } from "../../services/userService";

export default function AddEngineerModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    department: "Civil & Structural",
    workMode: "field",
    experience: 2,
    city: ""
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleResetAndClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const generateRandomPassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$";
    let pwd = "";
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm((prev) => ({ ...prev, password: pwd }));
    setShowPassword(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setErrorMsg("Full Name, Email, and Password are required.");
      return;
    }

    try {
      setLoading(true);
      const res = await createEngineer(form);
      
      setCreatedCredentials({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: "Engineer / Client",
        rollNumber: res.user?.rollNumber || ""
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to create engineer account.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `👷 ConstructAI Engineer Access Credentials:\n\nPortal: ${window.location.origin}\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.password}\n${createdCredentials.rollNumber ? `Roll No: ${createdCredentials.rollNumber}\n` : ""}\nPlease log in and change your password in your profile settings.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleResetAndClose = () => {
    setForm({
      name: "",
      email: "",
      password: "",
      phone: "",
      department: "Civil & Structural",
      workMode: "field",
      experience: 2,
      city: ""
    });
    setCreatedCredentials(null);
    setCopied(false);
    setErrorMsg("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-engineer-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          aria-label="Close add engineer dialog"
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <h3 id="add-engineer-modal-title" className="text-lg font-black text-white">
              Add New Engineer
            </h3>
            <p className="text-xs text-slate-400">Create login credentials for team members & field staff.</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Success View: Credentials Hand-off Box */}
        {createdCredentials ? (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4" />
                <span>Account Created Successfully</span>
              </div>
              <p className="text-xs text-slate-300">
                Share these credentials with the engineer. They can log in immediately from the main portal sign-in page.
              </p>

              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Name:</span>
                  <span className="text-white font-bold">{createdCredentials.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="text-indigo-400 font-bold">{createdCredentials.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Password:</span>
                  <span className="text-amber-400 font-bold">{createdCredentials.password}</span>
                </div>
                {createdCredentials.rollNumber && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Roll Number:</span>
                    <span className="text-slate-300 font-bold">{createdCredentials.rollNumber}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? "Copied to Clipboard!" : "Copy Credentials"}</span>
              </button>
              <button
                type="button"
                onClick={handleResetAndClose}
                className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="eng-full-name"
                  className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5"
                >
                  Engineer Full Name *
                </label>
                <input
                  id="eng-full-name"
                  type="text"
                  name="name"
                  placeholder="e.g. Anand Kumar"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="eng-email-addr"
                  className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5"
                >
                  Email Address *
                </label>
                <input
                  id="eng-email-addr"
                  type="email"
                  name="email"
                  placeholder="e.g. anand@company.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="eng-initial-password"
                  className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider"
                >
                  Initial Password *
                </label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none rounded-md px-1"
                >
                  <Key className="h-3 w-3" />
                  <span>Generate Password</span>
                </button>
              </div>
              <div className="relative">
                <input
                  id="eng-initial-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter or generate temporary password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3.5 pr-10 py-2.5 text-white placeholder-slate-600 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none rounded-md p-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="eng-phone-number"
                  className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5"
                >
                  Phone Number
                </label>
                <input
                  id="eng-phone-number"
                  type="text"
                  name="phone"
                  placeholder="e.g. +91 9876543210"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="eng-city-loc"
                  className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5"
                >
                  City / Location
                </label>
                <input
                  id="eng-city-loc"
                  type="text"
                  name="city"
                  placeholder="e.g. Hyderabad"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="eng-department-select"
                  className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5"
                >
                  Department
                </label>
                <select
                  id="eng-department-select"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                >
                  <option value="Civil & Structural">Civil & Structural</option>
                  <option value="Site Execution">Site Execution</option>
                  <option value="MEP & HVAC">MEP & HVAC</option>
                  <option value="Planning & Estimation">Planning & Estimation</option>
                  <option value="Quality & Safety">Quality & Safety</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="eng-workmode-select"
                  className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5"
                >
                  Work Mode
                </label>
                <select
                  id="eng-workmode-select"
                  name="workMode"
                  value={form.workMode}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                >
                  <option value="field">👷 Field Engineer (GPS & Site Check-in)</option>
                  <option value="office">📄 Office Engineer (Design & Review)</option>
                  <option value="hybrid">🏢 Hybrid (Office + Site)</option>
                </select>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <UserPlus className="h-4 w-4" />
                <span>{loading ? "Creating Account..." : "Create Engineer Account"}</span>
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
