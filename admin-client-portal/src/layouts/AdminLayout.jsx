import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import AIAssistantSidebar from "../components/dashboard/AIAssistantSidebar";

function AdminLayout({ children, noScroll = false }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`flex ${noScroll ? "h-screen overflow-hidden" : "min-h-screen"} bg-background text-text-primary transition-colors duration-200`}>
      {/* Sidebar */}
      <Sidebar open={open} setOpen={setOpen} />

      {/* Main Content */}
      <div className={`flex-1 min-w-0 md:pl-64 flex flex-col ${noScroll ? "h-screen overflow-hidden" : ""}`}>
        <Navbar setOpen={setOpen} />

        <main className={`flex-1 p-3 md:p-4 ${noScroll ? "overflow-hidden flex flex-col min-h-0" : ""}`}>
          {children}
        </main>
      </div>

      {/* Global AI Assistant Floating Sidebar */}
      <AIAssistantSidebar />
    </div>
  );
}

export default AdminLayout;