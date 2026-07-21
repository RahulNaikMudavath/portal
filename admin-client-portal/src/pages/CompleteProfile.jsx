import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, User, CheckCircle, ShieldAlert, ArrowRight, Sparkles, Building, Briefcase } from "lucide-react";

export default function CompleteProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    avatar: "",
    phone: "",
    organization: "",
    role: "client", // default: client (engineer)
    department: "",
    engineerType: "field", // field or office
    jobTitle: "",
    experience: "",
    address: "",
    emergencyContact: "",
    bio: "",
    preferredLanguage: "English"
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  useEffect(() => {
    // Read cached user from google auth session
    const cachedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!cachedUser.email) {
      navigate("/");
      return;
    }

    setProfile(prev => ({
      ...prev,
      name: cachedUser.name || "",
      email: cachedUser.email || "",
      avatar: cachedUser.avatar || "",
      role: cachedUser.role || "client"
    }));

    if (cachedUser.avatar) {
      setPhotoPreview(cachedUser.avatar);
    }
    setLoading(false);
  }, [navigate]);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handlePhotoSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleCompleteSetup = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Required field validation
    if (!profile.phone.trim()) {
      setErrorMsg("Phone number is required to receive site coordination updates.");
      return;
    }
    if (!profile.organization.trim()) {
      setErrorMsg("Organization / Company name is required.");
      return;
    }
    if (!profile.role) {
      setErrorMsg("Please select your workspace role type.");
      return;
    }
    if (!profile.department.trim()) {
      setErrorMsg("Department name is required.");
      return;
    }
    if (profile.role === "client" && !profile.engineerType) {
      setErrorMsg("Please select your engineer configuration mode.");
      return;
    }

    try {
      setSaving(true);
      
      const formData = new FormData();
      formData.append("phone", profile.phone.trim());
      formData.append("organization", profile.organization.trim());
      formData.append("role", profile.role);
      formData.append("department", profile.department.trim());
      formData.append("engineerType", profile.role === "admin" ? "none" : profile.engineerType);
      
      formData.append("jobTitle", profile.jobTitle.trim());
      formData.append("experience", profile.experience ? Number(profile.experience) : 0);
      formData.append("address", profile.address.trim());
      formData.append("emergencyContact", profile.emergencyContact.trim());
      formData.append("bio", profile.bio.trim());
      formData.append("preferredLanguage", profile.preferredLanguage);

      if (photoFile) {
        formData.append("photo", photoFile);
      }

      const res = await API.put("/api/auth/complete-profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      // Update JWT and user details in session cache
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Notify other parts of the app that user profile changed
      try {
        window.dispatchEvent(new CustomEvent("user-updated", { detail: res.data.user }));
      } catch (err) {
        // ignore
      }

      setSuccessMsg("Onboarding completed successfully! Launching workspace...");

      setTimeout(() => {
        if (res.data.user.role === "admin") {
          navigate("/admin/work-inbox");
        } else {
          navigate("/client/dashboard");
        }
      }, 1500);

    } catch (err) {
      console.error("Complete Profile onboarding error:", err);
      setErrorMsg(err.response?.data?.message || "Failed to finalize profile setup.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto"></div>
          <p className="text-xs text-slate-400">Verifying imported Google session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-955 text-slate-100 p-6 md:p-12 relative overflow-hidden select-none flex items-center justify-center">
      
      {/* Background blueprint details */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl space-y-8"
      >
        
        {/* Onboarding Intro Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">👋</span>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Welcome to ConstructAI</h1>
            </div>
            <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
              We've imported your Google account. Just complete a few details to finish setting up your workspace.
            </p>
          </div>
          
          {/* Circular Google Image Selector */}
          <div className="flex items-center gap-4 self-start md:self-center">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-indigo-500 bg-slate-950 flex items-center justify-center text-slate-500 cursor-pointer group shadow-lg"
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Google Avatar" className="h-full w-full object-cover" />
              ) : (
                <User className="h-8 w-8" />
              )}
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-150">
                <Camera className="h-4.5 w-4.5 text-white" />
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Workspace Avatar</span>
              <p className="text-xs text-slate-400 font-semibold truncate max-w-[180px]">{profile.name}</p>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handlePhotoSelect} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
        </div>

        {/* Feedback alerts */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 text-xs font-semibold text-rose-400"
            >
              <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-xs font-semibold text-emerald-400"
            >
              <CheckCircle className="h-4.5 w-4.5 shrink-0 animate-bounce" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleCompleteSetup} className="space-y-6 text-xs text-slate-400">
          
          {/* Read Only Google info card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/20 border border-slate-850 p-4 rounded-2xl">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Imported Name</label>
              <input
                type="text"
                value={profile.name}
                disabled
                className="w-full bg-slate-800/40 border border-slate-800 rounded-xl px-3 py-2 text-slate-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Imported Email</label>
              <input
                type="text"
                value={profile.email}
                disabled
                className="w-full bg-slate-800/40 border border-slate-800 rounded-xl px-3 py-2 text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          {/* REQUIRED ADDITIONAL INFORMATION */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-indigo-400">Required Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-350 mb-1.5">Phone Number *</label>
                <input
                  type="text"
                  name="phone"
                  placeholder="e.g. 9533956730"
                  value={profile.phone}
                  onChange={handleChange}
                  className="w-full bg-slate-955 border border-slate-850 rounded-xl px-4 py-3 text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500/50"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-350 mb-1.5">Organization / Company Name *</label>
                <input
                  type="text"
                  name="organization"
                  placeholder="e.g. Maaran Consultancy"
                  value={profile.organization}
                  onChange={handleChange}
                  className="w-full bg-slate-955 border border-slate-850 rounded-xl px-4 py-3 text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500/50"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-350 mb-1.5">Department *</label>
                <input
                  type="text"
                  name="department"
                  placeholder="e.g. Structures, Valuation"
                  value={profile.department}
                  onChange={handleChange}
                  className="w-full bg-slate-955 border border-slate-850 rounded-xl px-4 py-3 text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500/50"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-350 mb-1.5">Workspace Role Type *</label>
                <select
                  name="role"
                  value={profile.role}
                  onChange={handleChange}
                  className="w-full bg-slate-955 border border-slate-850 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50"
                  required
                >
                  <option value="client">👷 Engineer Mode</option>
                  <option value="admin">👑 Portal Administrator</option>
                </select>
              </div>

              {profile.role === "client" && (
                <div>
                  <label className="block font-semibold text-slate-355 mb-1.5">Engineer Assignment Type *</label>
                  <select
                    name="engineerType"
                    value={profile.engineerType}
                    onChange={handleChange}
                    className="w-full bg-slate-955 border border-slate-850 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50"
                    required
                  >
                    <option value="office">💻 Office Engineer</option>
                    <option value="field">🚗 Field Engineer</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* OPTIONAL ADDITIONAL DETAILS */}
          <div className="space-y-4 pt-2 border-t border-slate-800/60">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-500">Optional Personal Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-400 mb-1.5">Job Title</label>
                <input
                  type="text"
                  name="jobTitle"
                  placeholder="e.g. Structural Analyst"
                  value={profile.jobTitle}
                  onChange={handleChange}
                  className="w-full bg-slate-955 border border-slate-850 rounded-xl px-4 py-3 text-white placeholder-slate-650 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5">Years of Experience</label>
                <input
                  type="number"
                  name="experience"
                  min="0"
                  placeholder="e.g. 5"
                  value={profile.experience}
                  onChange={handleChange}
                  className="w-full bg-slate-955 border border-slate-850 rounded-xl px-4 py-3 text-white placeholder-slate-650 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5">Preferred Language</label>
                <select
                  name="preferredLanguage"
                  value={profile.preferredLanguage}
                  onChange={handleChange}
                  className="w-full bg-slate-955 border border-slate-850 rounded-xl px-4 py-3 text-white focus:outline-none"
                >
                  <option value="English">English</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Tamil">Tamil</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1.5">Emergency Contact Details</label>
                <input
                  type="text"
                  name="emergencyContact"
                  placeholder="e.g. Name - Relation - Phone"
                  value={profile.emergencyContact}
                  onChange={handleChange}
                  className="w-full bg-slate-955 border border-slate-850 rounded-xl px-4 py-3 text-white placeholder-slate-650 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5">Office / Site Address</label>
                <input
                  type="text"
                  name="address"
                  placeholder="e.g. Arundelpet, Guntur"
                  value={profile.address}
                  onChange={handleChange}
                  className="w-full bg-slate-955 border border-slate-850 rounded-xl px-4 py-3 text-white placeholder-slate-650 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1.5">Brief Bio</label>
              <textarea
                name="bio"
                placeholder="Describe your design and valuation expertise..."
                rows="3"
                value={profile.bio}
                onChange={handleChange}
                className="w-full bg-slate-955 border border-slate-850 rounded-xl px-4 py-3 text-white placeholder-slate-650 focus:outline-none resize-none"
              ></textarea>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider py-4 px-6 rounded-xl transition duration-250 flex items-center gap-2 shadow-lg shadow-indigo-950/20 active:scale-97 cursor-pointer"
            >
              <span>{saving ? "Finalizing Workspace..." : "Complete Setup"}</span>
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          </div>

        </form>

      </motion.div>
    </div>
  );
}
