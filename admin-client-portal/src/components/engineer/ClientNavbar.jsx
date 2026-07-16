import { Link, useLocation } from "react-router-dom";
import NotificationBell from "../NotificationBell";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";

function ClientNavbar({ setOpen }) {
  const location = useLocation();
  const { darkMode, setDarkMode } = useContext(ThemeContext);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const pageTitle = getPageTitle(location.pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="flex min-h-20 items-center justify-between gap-4 px-4 md:px-6">
        {/* Mobile sidebar button + page title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-lg text-white md:hidden"
            aria-label="Open menu"
          >
            ☰
          </button>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-300">
              Client Portal
            </p>

            <h1 className="mt-1 text-lg font-bold text-white md:text-xl">
              {pageTitle}
            </h1>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <NotificationBell />

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-lg text-white transition hover:bg-slate-800"
            aria-label="Toggle theme"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

          <Link
            to="/client/profile"
            className="hidden items-center gap-3 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 transition hover:bg-slate-800 sm:flex"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 font-bold text-white">
              {(user.name || "C").charAt(0).toUpperCase()}
            </div>

            <div className="max-w-28 text-left">
              <p className="truncate text-sm font-semibold text-white">
                {user.name || "Client"}
              </p>

              <p className="text-xs text-slate-400">View profile</p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}

function getPageTitle(pathname) {
  if (pathname.includes("/client/tasks")) return "My Tasks";
  if (pathname.includes("/client/submissions")) return "My Submissions";
  if (pathname.includes("/client/profile")) return "My Profile";

  return "Dashboard";
}

export default ClientNavbar;