import { useState, useEffect } from "react";
import ClientSidebar from "../components/engineer/ClientSidebar";
import ClientNavbar from "../components/engineer/ClientNavbar";
import AIAssistantSidebar from "../components/dashboard/AIAssistantSidebar";
import { isAppOnline, getOfflineQueue, syncOfflineQueue } from "../utils/offlineSync";
import { useLocationTracker } from "../hooks/useLocationTracker";

function ClientLayout({ children }) {
  useLocationTracker();

  const [open, setOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(isAppOnline());
  const [queueCount, setQueueCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState("idle"); // idle, syncing, synced

  const checkQueue = () => {
    setQueueCount(getOfflineQueue().length);
  };

  useEffect(() => {
    checkQueue();

    const handleOnline = async () => {
      setIsOnline(true);
      setSyncStatus("syncing");
      await syncOfflineQueue();
      setSyncStatus("synced");
      checkQueue();
      setTimeout(() => setSyncStatus("idle"), 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      checkQueue();
    };

    const handleQueueUpdate = () => {
      checkQueue();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("offline-queue-updated", handleQueueUpdate);

    // Initial sync trigger if online and queue is not empty
    if (isAppOnline() && getOfflineQueue().length > 0) {
      handleOnline();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("offline-queue-updated", handleQueueUpdate);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-text-primary transition-colors duration-200">

      <ClientSidebar
        open={open}
        setOpen={setOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 md:pl-64">

        <ClientNavbar setOpen={setOpen} />

        {/* Dynamic Offline / Sync Status Banner */}
        {(!isOnline || syncStatus !== "idle" || queueCount > 0) && (
          <div className={`px-6 py-2.5 text-xs font-bold text-center flex items-center justify-center gap-2 transition duration-300 ${
            !isOnline 
              ? "bg-amber-600 text-white" 
              : syncStatus === "syncing" 
              ? "bg-indigo-600 text-indigo-50 animate-pulse" 
              : "bg-emerald-600 text-emerald-50"
          }`}>
            <span className="h-2 w-2 rounded-full bg-white animate-ping"></span>
            <span>
              {!isOnline 
                ? `● Field Mode Offline. ${queueCount > 0 ? `${queueCount} actions queued locally.` : "Working locally."}`
                : syncStatus === "syncing"
                ? `● Syncing local actions...`
                : `● Connected & Synced! All updates saved.`}
            </span>
          </div>
        )}

        <main className="p-4 sm:p-6 flex-1 min-w-0">
          {children}
        </main>

      </div>

      {/* Global AI Assistant Floating Sidebar */}
      <AIAssistantSidebar />
    </div>
  );
}

export default ClientLayout;