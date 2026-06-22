import { Menu } from "lucide-react";

function ClientNavbar({ setOpen }) {
  return (
    <header className="bg-slate-900 border-b border-slate-800">

      <div className="flex justify-between items-center px-6 py-4">

        <button
          className="md:hidden text-white"
          onClick={() => setOpen(true)}
        >
          <Menu />
        </button>

        <h2 className="text-white font-semibold">
          Client Workspace
        </h2>

      </div>

    </header>
  );
}

export default ClientNavbar;