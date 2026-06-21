import { Link, useLocation } from "react-router-dom";

function ClientSidebar({ open, setOpen }) {
  const location = useLocation();

  const links = [
    { name: "Dashboard", path: "/client/dashboard" },
    { name: "My Tasks", path: "/client/tasks" },
    { name: "Submissions", path: "/client/submissions" },
    { name: "Profile", path: "/client/profile" }
  ];

  return (
    <aside
      className={`
      fixed md:static top-0 left-0 z-50
      h-screen w-64
      bg-slate-950
      border-r border-slate-800
      transform transition-transform duration-300
      ${open ? "translate-x-0" : "-translate-x-full"}
      md:translate-x-0
      `}
    >
      <div className="p-6">

        <h1 className="text-white text-2xl font-bold mb-8">
          Client Portal
        </h1>

        <nav className="space-y-2">

          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setOpen(false)}
              className={`
                block px-4 py-3 rounded-xl
                ${
                  location.pathname === link.path
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
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