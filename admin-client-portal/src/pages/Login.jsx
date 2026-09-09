import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/authService";
import { motion } from "framer-motion";
import { useGoogleLogin } from "@react-oauth/google";
import { ArrowLeft } from "lucide-react";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
      console.error("Google login backend error:", error);
      const msg = error.response?.data?.message || error.response?.data?.error || (error.message === "Network Error" ? "Unable to connect to the backend server. Please retry in a few seconds." : "Google Authentication failed.");
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  // Official Google OAuth hook with account selector
  const loginWithGoogle = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      if (tokenResponse?.access_token) {
        handleGoogleLoginSuccess(tokenResponse.access_token);
      }
    },
    onError: (errorResponse) => {
      console.error("Google Auth popup error:", errorResponse);
      const errorMsg = errorResponse?.error_description || errorResponse?.error || "Google Sign-In failed.";
      if (errorResponse?.error !== "popup_closed_by_user") {
        alert(errorMsg);
      }
    },
    prompt: "select_account"
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await login(form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Role redirect
      if (res.data.user.role === "admin") {
        navigate("/admin/work-inbox");
      } else {
        navigate("/client/dashboard");
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || (error.message === "Network Error" ? "Backend server is waking up or unreachable. Please retry in a moment." : "Login failed. Check your credentials.");
      alert(msg);
    } finally {
      setLoading(false);
    }
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
                <p className="text-[8px] uppercase font-bold text-amber-400 tracking-widest">
                  Engineers & Consultancy
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">ConstructAI ERP</h3>
              <p className="text-xs text-slate-400">
                Design review pipelines, WhatsApp dispatch, GPS checklists, and field inspections.
              </p>
            </div>
          </div>

          {/* Enterprise Features List */}
          <div className="space-y-3 bg-slate-950/40 border border-slate-800/80 p-4 rounded-2xl">
            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Enterprise Console</span>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5 text-slate-300">
                <span className="text-indigo-400 text-sm">🛡️</span>
                <span className="text-[11px] font-medium">Role-Isolated Dashboards</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <span className="text-emerald-400 text-sm">📍</span>
                <span className="text-[11px] font-medium">Live GPS Site Check-ins</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <span className="text-amber-400 text-sm">⚡</span>
                <span className="text-[11px] font-medium">Real-Time Dispatch Sync</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 border-t border-slate-800/80 pt-4">
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
          <div className="mb-6 flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-lg font-bold text-white">Sign In</h3>
              <p className="text-xs text-slate-400">Access the construction management console.</p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-white text-xs font-semibold transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>

          <div className="space-y-4 text-xs text-slate-400">
            
            {/* Real Google OAuth Button */}
            <button
              onClick={() => loginWithGoogle()}
              type="button"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 transition duration-150 font-medium text-xs text-white shadow-sm active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              <svg className="h-4.5 w-4.5 shrink-0" viewBox="0 0 24 24">
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
              <span className="font-semibold tracking-wide">Sign in with Google</span>
            </button>

            <div className="flex items-center gap-2 py-1">
              <div className="h-px bg-slate-800 flex-1"></div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">or continue with email</span>
              <div className="h-px bg-slate-800 flex-1"></div>
            </div>

            {/* Manual Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="login-email-input"
                  className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5"
                >
                  Email Address
                </label>
                <input
                  id="login-email-input"
                  type="email"
                  name="email"
                  placeholder="e.g. name@company.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="login-password-input"
                  className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5"
                >
                  Password
                </label>
                <input
                  id="login-password-input"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl transition duration-200 active:scale-95 shadow-md shadow-indigo-600/10 cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none disabled:opacity-50"
              >
                {loading ? "Authenticating..." : "🚪 Connect Portal"}
              </button>
            </form>

            <div className="pt-3 text-center text-xs border-t border-slate-800/80 flex items-center justify-between">
              <p className="text-slate-400 text-[11px]">
                New user?{" "}
                <Link to="/signup" className="text-indigo-400 font-bold hover:underline">
                  Create Account
                </Link>
              </p>
              <Link to="/" className="text-[11px] text-amber-400 hover:underline">
                Explore Services & Approvals →
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
}

export default Login;