import { Link, useLocation } from "react-router-dom";

function Sidebar({ open, setOpen }) {
  const location = useLocation();
const links = [
  { label: "Dashboard", path: "/admin/dashboard", icon: "🏠" },
  { label: "Projects", path: "/admin/projects", icon: "🏗️" },
  { label: "Tasks", path: "/admin/tasks", icon: "📋" },
  { label: "Engineer Performance", path: "/admin/engineer-performance", icon: "📊" },
  { label: "Calendar", path: "/admin/calendar", icon: "📅" },
  { label: "Reports Center", path: "/admin/reports", icon: "📑" },
  { label: "Documents", path: "/admin/documents", icon: "📁" },
  { label: "Create Task", path: "/admin/create", icon: "➕" },
  { label: "Activity", path: "/admin/activity", icon: "📜" },
  { label: "Work Inbox", path: "/admin/work-inbox", icon: "📥" },
  { label: "Profile", path: "/admin/profile", icon: "👤" },
];

  const isActive = (path) => location.pathname === path;

  return (
    <aside
      className={`fixed z-50 top-0 left-0 h-screen w-64 shrink-0 bg-slate-900 border-r border-slate-800 text-text-primary transform ${
        open ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 transition-transform duration-300`}
    >
      <div className="p-5 border-b border-border">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span>🚀</span> Admin Portal
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Workspace dashboard
        </p>
      </div>

      <nav className="flex flex-col gap-1 p-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
              isActive(link.path)
                ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold shadow-xs"
                : "text-text-secondary hover:bg-card-hover hover:text-text-primary"
            }`}
          >
            <span className="text-base">{link.icon}</span>
            <span className="font-semibold text-small">{link.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;