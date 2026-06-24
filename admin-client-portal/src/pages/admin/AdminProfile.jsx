import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import API from "../../services/api";

export default function AdminProfile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    company: "",
    address: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const res = await API.get("/api/users/profile");

      setProfile({
        name: res.data.name || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        city: res.data.city || "",
        company: res.data.company || "",
        address: res.data.address || "",
      });
    } catch (error) {
      console.error("Admin profile fetch error:", error);
      setMessage("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");

      const res = await API.put("/api/users/profile", {
        phone: profile.phone,
        city: profile.city,
        company: profile.company,
        address: profile.address,
      });

      const updatedUser = res.data.user;

      setProfile({
        name: updatedUser.name || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
        city: updatedUser.city || "",
        company: updatedUser.company || "",
        address: updatedUser.address || "",
      });

      const savedUser = JSON.parse(localStorage.getItem("user"));

      if (savedUser) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...savedUser,
            ...updatedUser,
          })
        );
      }

      setMessage("Profile updated successfully!");
    } catch (error) {
      console.error("Admin profile update error:", error);

      setMessage(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-white text-lg">Loading profile...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <div className="mb-7">
          <p className="text-blue-400 text-sm font-semibold uppercase tracking-wider">
            Account Settings
          </p>

          <h1 className="text-3xl font-bold text-white mt-2">
            Admin Profile
          </h1>

          <p className="text-slate-400 mt-2">
            Manage your account and contact information.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-slate-700 rounded-2xl p-6 sm:p-8"
        >
          {message && (
            <div
              className={`mb-6 rounded-lg px-4 py-3 text-sm ${
                message.includes("success")
                  ? "bg-green-500/15 text-green-400 border border-green-500/30"
                  : "bg-red-500/15 text-red-400 border border-red-500/30"
              }`}
            >
              {message}
            </div>
          )}

          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-800">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
              {profile.name?.charAt(0)?.toUpperCase() || "A"}
            </div>

            <div>
              <h2 className="text-white text-lg font-semibold">
                {profile.name}
              </h2>

              <p className="text-slate-400 text-sm">{profile.email}</p>

              <span className="inline-block mt-2 px-2.5 py-1 rounded-full text-xs bg-purple-500/15 text-purple-300 border border-purple-500/20">
                Administrator
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Full Name
              </label>

              <input
                type="text"
                value={profile.name}
                disabled
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Email Address
              </label>

              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Phone Number
              </label>

              <input
                type="text"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                City
              </label>

              <input
                type="text"
                name="city"
                value={profile.city}
                onChange={handleChange}
                placeholder="Enter your city"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Company
              </label>

              <input
                type="text"
                name="company"
                value={profile.company}
                onChange={handleChange}
                placeholder="Enter your company name"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Address
              </label>

              <input
                type="text"
                name="address"
                value={profile.address}
                onChange={handleChange}
                placeholder="Enter your address"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mt-7 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}