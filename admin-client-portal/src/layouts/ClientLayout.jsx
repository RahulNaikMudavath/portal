import { useState } from "react";
import ClientSidebar from "../components/engineer/ClientSidebar";
import ClientNavbar from "../components/engineer/ClientNavbar";

function ClientLayout({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-950">

      <ClientSidebar
        open={open}
        setOpen={setOpen}
      />

      <div className="flex-1">

        <ClientNavbar setOpen={setOpen} />

        <main className="p-6">
          {children}
        </main>

      </div>

    </div>
  );
}

export default ClientLayout;