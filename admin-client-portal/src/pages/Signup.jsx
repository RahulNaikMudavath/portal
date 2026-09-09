import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../services/authService";
import { motion } from "framer-motion";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import API from "../services/api";

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
      const errorMsg = errorResponse?.error_description || errorResponse?.error || "Google Sign-Up failed.";
      if (errorResponse?.error !== "popup_closed_by_user") {
        alert(errorMsg);
      }
    },
    prompt: "select_account"
  });

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
              <h3 className="text-xl font-bold text-white">Join the Team</h3>
              <p className="text-xs text-slate-400">
                Setup your credentials to access tasks, document vaults, and structural analytics.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3 bg-slate-950/20 border border-slate-800/80 p-3 rounded-xl">
              <span className="text-lg">💼</span>
              <div>
                <h4 className="font-bold text-white">Client Mode</h4>
                <p className="text-slate-400 text-[10px] mt-0.5">Approve site calculations, view specs, and sign off.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-950/20 border border-slate-800/80 p-3 rounded-xl">
              <span className="text-lg">👷</span>
              <div>
                <h4 className="font-bold text-white">Engineer Mode</h4>
                <p className="text-slate-400 text-[10px] mt-0.5">Access checklist paths, map navigation, and input notes.</p>
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
          <div className="mb-6 space-y-0.5">
            <h3 className="text-lg font-bold text-white">Create Account</h3>
            <p className="text-xs text-slate-400">Fill in the fields below or sign up instantly with Google.</p>
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
              <span className="font-semibold tracking-wide">Sign up with Google</span>
            </button>

            <div className="flex items-center gap-2 py-1">
              <div className="h-px bg-slate-800 flex-1"></div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">or continue with email</span>
              <div className="h-px bg-slate-800 flex-1"></div>
            </div>

            <form onSubmit={handleSignup} className="space-y-4 text-xs text-slate-400">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Ramesh Naik"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="e.g. ramesh@maaran.com"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Create a strong password"
                      value={form.password}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-10 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="e.g. +91 9876543210"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl transition duration-200 active:scale-95 shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <UserPlus className="h-4.5 w-4.5" />
                  <span>{loading ? "Registering Account..." : "Create Account"}</span>
                </button>
              </div>
            </form>

            <div className="mt-6 text-center text-xs border-t border-slate-800/80 pt-4">
              <p className="text-slate-400">
                Already have an account?{" "}
                <Link to="/" className="text-indigo-400 font-bold hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </div>

        </motion.div>
      </div>

    </div>
  );
}

export default Signup;