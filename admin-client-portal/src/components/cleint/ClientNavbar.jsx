import { Menu } from "lucide-react";
import NotificationBell from "../NotificationBell";

function ClientNavbar({ setOpen }) {
  return (
    <header className="bg-slate-900 border-b border-slate-800">

      <div className="flex items-center px-6 py-4">

        <div className="flex items-center">
          <button
            className="md:hidden text-white"
            onClick={() => setOpen(true)}
          >
            <Menu />
          </button>
        </div>

        <div className="flex-1 text-center">
          <h2 className="text-white font-semibold">
            Client Workspace
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <NotificationBell />
        </div>

      </div>

    </header>
  );
}

export default ClientNavbar;