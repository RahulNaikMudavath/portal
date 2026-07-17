import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../services/authService";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Eye, EyeOff, Plus, X } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import API from "../services/api";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    company: "",
    address: "",
    role: "client",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Sandbox Google State
  const [showSandboxGoogle, setShowSandboxGoogle] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleStatus, setGoogleStatus] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const mockGoogleAccounts = [
    { name: "Rahul Naik", email: "rahul.naik@gmail.com", avatar: "RN" },
    { name: "Admin Consultancy", email: "admin@constructai.com", avatar: "AC" },
    { name: "Engineer Maaran", email: "engineer.maaran@gmail.com", avatar: "EM" }
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      alert("Name, Email, and Password are required fields.");
      return;
    }

    try {
      setLoading(true);
      await signup(form);
      alert("Registration successful! You can now log in.");
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  // Google Login successful handler
  const handleGoogleLoginSuccess = async (token) => {
    try {
      setLoading(true);
      const res = await API.post("/api/auth/google", { token });
      
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      if (!res.data.user.isOnboarded) {
        navigate("/complete-profile");
      } else {
        if (res.data.user.role === "admin") {
          navigate("/admin/work-inbox");
        } else {
          navigate("/client/dashboard");
        }
      }
    } catch (error) {
      console.error("Google login error:", error);
      alert(error.response?.data?.message || "Google Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  // Official Google OAuth hook
  const loginWithGoogle = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      handleGoogleLoginSuccess(tokenResponse.access_token);
    },
    onError: (err) => {
      console.error("Google Auth failed:", err);
      setShowSandboxGoogle(true);
    }
  });

  const handleGoogleClick = () => {
    loginWithGoogle();
  };

  const selectSandboxAccount = (account) => {
    setGoogleStatus(`Signing in as ${account.name}...`);
    setTimeout(() => {
      setGoogleStatus("");
      setShowSandboxGoogle(false);
      handleGoogleLoginSuccess(`mock-${account.email}`);
    }, 1000);
  };

  const handleCustomSandboxAutofill = (e) => {
    e.preventDefault();
    if (!googleEmail || !googleEmail.includes("@")) {
      setGoogleStatus("Please enter a valid Google email address.");
      return;
    }
    setGoogleStatus("Connecting Google API...");
    setTimeout(() => {
      setGoogleStatus("");
      setShowSandboxGoogle(false);
      setShowCustomInput(false);
      handleGoogleLoginSuccess(`mock-${googleEmail}`);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 md:p-6 relative overflow-hidden select-none">
      
      {/* Animated Blueprint Background Grid */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Brand Guidelines (col-span-4) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="md:col-span-4 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between space-y-6 backdrop-blur-xl"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl">🏗️</span>
              </div>
              <div>
                <h2 className="text-md font-black tracking-wider text-white">MAARAN</h2>
                <p className="text-[8px] uppercase font-bold text-amber-450 tracking-widest">
                  Engineers & Consultancy
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Join the Team</h3>
              <p className="text-xs text-slate-400">
                Setup your credentials to access tasks, document vaults, and structural analytics.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3 bg-slate-950/20 border border-slate-850 p-3 rounded-xl">
              <span className="text-lg">💼</span>
              <div>
                <h4 className="font-bold text-white">Client Mode</h4>
                <p className="text-slate-450 text-[10px] mt-0.5">Approve site calculations, view specs, and sign off.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-950/20 border border-slate-850 p-3 rounded-xl">
              <span className="text-lg">👷</span>
              <div>
                <h4 className="font-bold text-white">Engineer Mode</h4>
                <p className="text-slate-450 text-[10px] mt-0.5">Access checklist paths, map navigation, and input notes.</p>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 border-t border-slate-850 pt-4">
            <p>Support: maaranengineers2016@gmail.com</p>
          </div>
        </motion.div>

        {/* Right Column: Clean Form (col-span-8) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="md:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col justify-center relative overflow-hidden"
        >
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-0.5">
              <h3 className="text-lg font-bold text-white">Create Account</h3>
              <p className="text-xs text-slate-400">Fill in the fields below to register your workspace.</p>
            </div>
            
            {/* Google Signup Button */}
            <button
              onClick={handleGoogleClick}
              type="button"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-900 rounded-xl transition text-xs font-bold text-white shadow-xs self-start cursor-pointer"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.48 15 0 12 0 7.35 0 3.37 2.67 1.43 6.56l3.86 3C6.23 6.94 8.89 5.04 12 5.04z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.42 3.58v2.98h3.91c2.28-2.1 3.54-5.19 3.54-8.71z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.29 14.44c-.25-.74-.39-1.54-.39-2.37s.14-1.63.39-2.37l-3.86-3C.56 8.56 0 10.22 0 12s.56 3.44 1.43 5.31l3.86-3z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.97-1.07 7.96-2.91l-3.91-2.98c-1.08.72-2.47 1.16-4.05 1.16-3.11 0-5.77-1.9-6.71-4.52l-3.86 3C3.37 21.33 7.35 24 12 24z"
                />
              </svg>
              <span>Sign Up with Google</span>
            </button>
          </div>

          <form onSubmit={handleSignup} className="space-y-4 text-xs text-slate-400">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-450 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Ramesh Naik"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500/50"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-455 mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="e.g. ramesh@maaran.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full bg-slate-955 border border-slate-850 rounded-xl p-3 text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500/50"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-450 mb-1">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full bg-slate-955 border border-slate-855 rounded-xl pl-3 pr-10 py-3 text-white placeholder-slate-655 focus:outline-none focus:border-indigo-500/50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-505 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-455 mb-1">Role Type *</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full bg-slate-955 border border-slate-850 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500/50"
                >
                  <option value="client">👨‍💼 Client / Engineer</option>
                  <option value="admin">👑 Portal Administrator</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider py-4 px-4 rounded-xl transition duration-200 active:scale-95 shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2 cursor-pointer animate-pulse-slow"
              >
                <UserPlus className="h-4.5 w-4.5" />
                <span>{loading ? "Registering Account..." : "Create Account"}</span>
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs border-t border-slate-850 pt-4">
            <p className="text-slate-455">
              Already have an account?{" "}
              <Link to="/" className="text-indigo-400 font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>

        </motion.div>
      </div>

      {/* Sandbox Google account selector modal */}
      <AnimatePresence>
        {showSandboxGoogle && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-6 z-50 backdrop-blur-xs"
          >
            <div className="w-full max-w-sm bg-white text-slate-800 p-6 rounded-3xl space-y-4 shadow-2xl relative">
              
              <button 
                onClick={() => setShowSandboxGoogle(false)}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-slate-500 cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              <div className="text-center space-y-2 pb-2 border-b border-gray-100">
                <svg className="h-6 w-6 mx-auto" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.48 15 0 12 0 7.35 0 3.37 2.67 1.43 6.56l3.86 3C6.23 6.94 8.89 5.04 12 5.04z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.42 3.58v2.98h3.91c2.28-2.1 3.54-5.19 3.54-8.71z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.29 14.44c-.25-.74-.39-1.54-.39-2.37s.14-1.63.39-2.37l-3.86-3C.56 8.56 0 10.22 0 12s.56 3.44 1.43 5.31l3.86-3z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.97-1.07 7.96-2.91l-3.91-2.98c-1.08.72-2.47 1.16-4.05 1.16-3.11 0-5.77-1.9-6.71-4.52l-3.86 3C3.37 21.33 7.35 24 12 24z"
                  />
                </svg>
                <h4 className="text-sm font-bold text-slate-800">Choose an account</h4>
                <p className="text-[11px] text-slate-500">to continue to <span className="font-semibold text-indigo-650">ConstructAI</span></p>
              </div>

              {googleStatus ? (
                <div className="py-8 text-center space-y-3">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-650 border-t-transparent mx-auto"></div>
                  <p className="text-xs text-slate-600 font-semibold">{googleStatus}</p>
                </div>
              ) : !showCustomInput ? (
                <div className="space-y-1.5">
                  {mockGoogleAccounts.map((account, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectSandboxAccount(account)}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition text-left cursor-pointer"
                    >
                      <div className="h-9 w-9 rounded-full bg-indigo-50 text-indigo-650 flex items-center justify-center font-bold text-xs shrink-0">
                        {account.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{account.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{account.email}</p>
                      </div>
                    </button>
                  ))}

                  <button
                    onClick={() => setShowCustomInput(true)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition text-left cursor-pointer"
                  >
                    <div className="h-9 w-9 rounded-full bg-gray-50 text-slate-650 flex items-center justify-center font-bold text-xs shrink-0 border border-gray-100">
                      <Plus className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800">Use another account</p>
                    </div>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCustomSandboxAutofill} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">
                      Google Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. name@gmail.com"
                      value={googleEmail}
                      onChange={(e) => setGoogleEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowCustomInput(false)}
                      type="button"
                      className="flex-1 py-2.5 rounded-xl border border-gray-200 text-slate-500 hover:text-slate-700 transition text-xs font-bold cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition text-xs shadow-xs cursor-pointer"
                    >
                      Sign In
                    </button>
                  </div>
                </form>
              )}

              {!googleStatus && (
                <div className="pt-2 text-center text-[10px] text-slate-400 border-t border-gray-100 leading-normal">
                  To continue, Google will share your name, email address, language preference, and profile picture with ConstructAI.
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default Signup;