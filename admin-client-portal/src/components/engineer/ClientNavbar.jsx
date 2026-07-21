import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import NotificationBell from "../NotificationBell";
import { ThemeToggle } from "../ThemeToggle";

function ClientNavbar({ setOpen }) {
  const location = useLocation();

  const initialUser = JSON.parse(localStorage.getItem("user") || "{}");
  const [userState, setUserState] = useState(initialUser);

  const pageTitle = getPageTitle(location.pathname);

  // Listen for profile updates from other parts of the app
  useEffect(() => {
    const handler = (ev) => {
      const updated = ev?.detail || JSON.parse(localStorage.getItem("user") || "{}");
      setUserState(updated);
    };

    window.addEventListener("user-updated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("user-updated", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur-md text-text-primary transition-colors duration-200">
      <div className="flex min-h-20 items-center justify-between gap-4 px-4 md:px-6">
        {/* Mobile sidebar button + page title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-900 px-3 py-2 text-lg text-slate-800 dark:text-white md:hidden"
            aria-label="Open menu"
          >
            ☰
          </button>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600 dark:text-indigo-300">
              Client Portal
            </p>

            <h1 className="mt-1 text-lg font-bold text-slate-800 dark:text-white md:text-xl">
              {pageTitle}
            </h1>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <NotificationBell />
          <ThemeToggle />

          <Link
            to="/client/profile"
            className="hidden items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 px-3 py-2 transition hover:bg-slate-200 dark:hover:bg-slate-800 sm:flex text-slate-800 dark:text-white"
          >
            {(() => {
              const avatarSrc = (userState && (userState.photo || userState.avatar)) || "";
              const avatarUrl = avatarSrc
                ? (avatarSrc.startsWith("http") || avatarSrc.startsWith("data:") ? avatarSrc : `http://localhost:5001/${avatarSrc}`)
                : null;

              return avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 font-bold text-white">
                  {(userState.name || "C").charAt(0).toUpperCase()}
                </div>
              );
            })()}

            <div className="max-w-28 text-left">
              <p className="truncate text-sm font-semibold text-white">
                {userState.name || "Client"}
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