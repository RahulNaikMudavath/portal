import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import AIAssistantSidebar from "../components/dashboard/AIAssistantSidebar";

function AdminLayout({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-text-primary transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar open={open} setOpen={setOpen} />

      {/* Main Content */}
      <div className="flex-1 min-w-0 md:pl-64">
        <Navbar setOpen={setOpen} />

        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* Global AI Assistant Floating Sidebar */}
      <AIAssistantSidebar />
    </div>
  );
}

export default AdminLayout;