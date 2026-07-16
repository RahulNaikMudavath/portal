import { useEffect, useState } from "react";
import ClientLayout from "../../layouts/ClientLayout";
import API from "../../services/api";

export default function Profile() {
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
    const loadProfile = async () => {
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

      setProfile({
        name: res.data.name || profile.name,
        email: res.data.email || profile.email,
        phone: res.data.phone || "",
        city: res.data.city || "",
        company: res.data.company || "",
        address: res.data.address || "",
      });

      // Updates the user saved in browser too
      const savedUser = JSON.parse(localStorage.getItem("user"));

      if (savedUser) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...savedUser,
            ...res.data,
          })
        );
      }

      setMessage("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update error:", error);

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
      <ClientLayout>
        <div className="text-white text-lg">Loading profile...</div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="max-w-4xl">
        <div className="mb-7">
          <h1 className="text-3xl font-bold text-white">My Profile</h1>
          <p className="text-slate-400 mt-2">
            Keep your contact and work details up to date.
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
              <p className="text-xs text-slate-500 mt-2">
                Name cannot be changed from this page.
              </p>
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
              <p className="text-xs text-slate-500 mt-2">
                Email cannot be changed from this page.
              </p>
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
                Company / College
              </label>
              <input
                type="text"
                name="company"
                value={profile.company}
                onChange={handleChange}
                placeholder="Enter company or college name"
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
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </ClientLayout>
  );
}