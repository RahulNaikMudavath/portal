import { Link, useLocation } from "react-router-dom";

function ClientSidebar({ open, setOpen }) {
  const location = useLocation();

  const links = [
    { name: "Dashboard", path: "/client/dashboard" },
    { name: "Projects", path: "/client/projects" },
    { name: "Documents", path: "/client/documents" },
    { name: "My Tasks", path: "/client/tasks" },
    { name: "Calendar", path: "/client/calendar" },
    { name: "Submissions", path: "/client/submissions" },
    { name: "Profile", path: "/client/profile" }
  ];

  return (
    <aside
      className={`
      fixed top-0 left-0 z-50
      h-screen w-64 shrink-0
      bg-slate-900 text-text-primary
      border-r border-slate-800
      transform transition-transform duration-300
      ${open ? "translate-x-0" : "-translate-x-full"}
      md:translate-x-0
      `}
    >
      <div className="p-6">

        <h1 className="text-text-primary text-xl font-bold flex items-center gap-2 mb-8">
          <span>🚀</span> Client Portal
        </h1>

        <nav className="space-y-1">

          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setOpen(false)}
              className={`
                block px-4 py-2.5 rounded-xl font-semibold text-small transition-all duration-200
                ${
                  location.pathname === link.path
                    ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-xs"
                    : "text-text-secondary hover:bg-card-hover hover:text-text-primary"
                }
              `}
            >
              {link.name}
            </Link>
          ))}

        </nav>

      </div>
    </aside>
  );
}

export default ClientSidebar;