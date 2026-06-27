import { Link, useLocation } from "react-router-dom";

function Sidebar({ open, setOpen }) {
  const location = useLocation();
const links = [
  { label: "Dashboard", path: "/admin/dashboard", icon: "🏠" },
  { label: "Tasks", path: "/admin/tasks", icon: "📋" },
  { label: "Create Task", path: "/admin/create", icon: "➕" },
  { label: "Activity", path: "/admin/activity", icon: "📜" },
  { label: "Work Inbox", path: "/admin/work-inbox", icon: "📥" },
  { label: "Profile", path: "/admin/profile", icon: "👤" },
];

  const isActive = (path) => location.pathname === path;

  return (
    <aside
      className={`fixed md:static z-50 top-0 left-0 h-full w-64 bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text border-r border-light-border dark:border-dark-border transform ${
        open ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 transition-transform duration-300`}
    >
      <div className="p-5 border-b border-light-border dark:border-dark-border">
        <h1 className="text-2xl font-bold">🚀 Admin Portal</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Workspace dashboard
        </p>
      </div>

      <nav className="flex flex-col gap-2 p-4">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              isActive(link.path)
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-light-text dark:hover:text-white"
            }`}
          >
            <span>{link.icon}</span>
            <span className="font-medium">{link.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;