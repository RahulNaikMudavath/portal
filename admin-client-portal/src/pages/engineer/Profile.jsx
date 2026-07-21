import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ClientLayout from "../../layouts/ClientLayout";
import API from "../../services/api";
import { Camera, User, Badge, ShieldAlert, Award, Calendar, CheckCircle } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    company: "",
    address: "",
    skills: [],
    department: "",
    workMode: "field",
    experience: 0,
    availability: "available",
    photo: ""
  });

  const [newSkill, setNewSkill] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const res = await API.get("/api/users/profile");
        const u = res.data;
        setProfile({
          name: u.name || "",
          email: u.email || "",
          phone: u.phone || "",
          city: u.city || "",
          company: u.company || "",
          address: u.address || "",
          skills: u.skills || [],
          department: u.department || "",
          workMode: u.workMode || "field",
          experience: u.experience || 0,
          availability: u.availability || "available",
          photo: u.photo || ""
        });
        if (u.photo) {
          setPhotoPreview(u.photo.startsWith("http") ? u.photo : `http://localhost:5001/${u.photo}`);
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
        setMessage("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    const skill = newSkill.trim();
    if (skill && !profile.skills.includes(skill)) {
      setProfile({
        ...profile,
        skills: [...profile.skills, skill]
      });
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter(s => s !== skillToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage("");

      const formData = new FormData();
      formData.append("phone", profile.phone);
      formData.append("city", profile.city);
      formData.append("company", profile.company);
      formData.append("address", profile.address);
      formData.append("department", profile.department);
      formData.append("workMode", profile.workMode);
      formData.append("experience", profile.experience);
      formData.append("availability", profile.availability);
      formData.append("skills", JSON.stringify(profile.skills));

      if (photoFile) {
        formData.append("photo", photoFile);
      }

      const res = await API.put("/api/users/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      const u = res.data.user;
      setProfile({
        name: u.name || "",
        email: u.email || "",
        phone: u.phone || "",
        city: u.city || "",
        company: u.company || "",
        address: u.address || "",
        skills: u.skills || [],
        department: u.department || "",
        workMode: u.workMode || "field",
        experience: u.experience || 0,
        availability: u.availability || "available",
        photo: u.photo || ""
      });

      if (u.photo) {
        setPhotoPreview(u.photo.startsWith("http") ? u.photo : `http://localhost:5001/${u.photo}`);
      }

      // Sync localstorage session user details
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const merged = savedUser ? { ...savedUser, ...u } : u;
      localStorage.setItem("user", JSON.stringify(merged));

      // Notify other parts of the app that user profile changed
      try {
        window.dispatchEvent(new CustomEvent("user-updated", { detail: merged }));
      } catch (err) {
        // ignore (some browsers restrict CustomEvent in certain contexts)
      }

      setMessage("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update error:", error);
      setMessage(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="max-w-4xl space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white">My Profile</h1>
            <p className="text-slate-400 mt-1">Configure your site skills, details, and work availability status.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              localStorage.clear();
              navigate("/");
            }}
            className="px-4 py-2 bg-danger text-white hover:bg-danger/90 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer self-start sm:self-auto shadow-xs"
          >
            Logout
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <div className={`rounded-xl px-4 py-3 text-xs font-semibold ${
              message.includes("successfully")
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
            }`}>
              {message}
            </div>
          )}

          {/* Profile Header Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-indigo-500 bg-slate-950 flex items-center justify-center text-slate-400">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-10 w-10" />
                )}
              </div>
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                <Camera className="h-5 w-5 text-white" />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoSelect} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            
            <div className="text-center sm:text-left space-y-1.5">
              <h2 className="text-xl font-bold text-white">{profile.name}</h2>
              <p className="text-xs text-slate-400">{profile.email}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1.5">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {profile.workMode}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                  profile.availability === "available" 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                    : profile.availability === "busy" 
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                }`}>
                  {profile.availability}
                </span>
              </div>
            </div>
          </div>

          {/* Form grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Contact Details Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-455">Contact Information</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-450 mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className="w-full bg-slate-955 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-450 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={profile.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    className="w-full bg-slate-955 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-450 mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={profile.address}
                    onChange={handleChange}
                    placeholder="Enter address"
                    className="w-full bg-slate-955 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Employment Details Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-455">Field & Work Details</h3>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-450 mb-1">Experience (Years)</label>
                    <input
                      type="number"
                      name="experience"
                      value={profile.experience}
                      onChange={handleChange}
                      min="0"
                      className="w-full bg-slate-955 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-450 mb-1">Work Mode</label>
                    <select
                      name="workMode"
                      value={profile.workMode}
                      onChange={handleChange}
                      className="w-full bg-slate-955 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                    >
                      <option value="office">Office</option>
                      <option value="field">Field</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-450 mb-1">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={profile.department}
                    onChange={handleChange}
                    placeholder="e.g. Valuation, Structures"
                    className="w-full bg-slate-955 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-450 mb-1">Availability</label>
                  <select
                    name="availability"
                    value={profile.availability}
                    onChange={handleChange}
                    className="w-full bg-slate-955 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                  >
                    <option value="available">Available / On Call</option>
                    <option value="busy">Busy / Engaged</option>
                    <option value="on-leave">On Leave</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* Skills Management Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-455">Skills & Credentials</h3>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Concrete Strength Audit, CAD layout"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="flex-1 bg-slate-955 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                />
                <button
                  onClick={handleAddSkill}
                  type="button"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase px-5 py-2.5 rounded-xl transition"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {profile.skills.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">No skills registered yet. Add some above.</span>
                ) : (
                  profile.skills.map((skill, idx) => (
                    <span 
                      key={idx} 
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-xs text-indigo-300"
                    >
                      {skill}
                      <button 
                        onClick={() => handleRemoveSkill(skill)} 
                        type="button" 
                        className="text-indigo-400 hover:text-rose-450 font-bold transition ml-1"
                      >
                        ✕
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-605 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl transition shadow-lg shadow-indigo-950/20 active:scale-97 disabled:opacity-50"
            >
              {saving ? "Saving Changes..." : "Save My Profile"}
            </button>
          </div>

        </form>
      </div>
    </ClientLayout>
  );
}