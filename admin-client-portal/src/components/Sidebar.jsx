import { Link } from "react-router-dom";

function Sidebar({ open, setOpen }) {
  return (
    <div
      className={`fixed md:static z-50 top-0 left-0 h-full w-64 bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text border-r border-light-border dark:border-dark-border transform ${
        open ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 transition-transform duration-300`}
    >
      <div className="p-5 text-2xl font-bold">🚀 Admin</div>

      <nav className="flex flex-col gap-4 p-5">
        <Link to="/admin/dashboard" onClick={() => setOpen(false)} className="hover:opacity-75 transition-opacity">
          Dashboard
        </Link>
        <Link to="/admin/tasks" onClick={() => setOpen(false)} className="hover:opacity-75 transition-opacity">
          Tasks
        </Link>
        <Link to="/admin/create" onClick={() => setOpen(false)} className="hover:opacity-75 transition-opacity">
          Create Task
        </Link>
      </nav>
    </div>
  );
}

export default Sidebar;