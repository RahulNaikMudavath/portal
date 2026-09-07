import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi, RefreshCw, CheckCircle2, HardDrive, AlertTriangle } from "lucide-react";
import { isAppOnline, getOfflineQueue, syncOfflineQueue } from "../../utils/offlineSync";

export default function OfflineStatusBar() {
  const [online, setOnline] = useState(isAppOnline());
  const [queueCount, setQueueCount] = useState(getOfflineQueue().length);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState("");
  const [offlineCacheNotice, setOfflineCacheNotice] = useState(null);

  useEffect(() => {
    const handleOnline = async () => {
      setOnline(true);
      const queue = getOfflineQueue();
      if (queue.length > 0) {
        setIsSyncing(true);
        const result = await syncOfflineQueue();
        setIsSyncing(false);
        setQueueCount(getOfflineQueue().length);
        if (result.synced > 0) {
          setSyncSuccessMsg(`Synced ${result.synced} offline site action(s)!`);
          setTimeout(() => setSyncSuccessMsg(""), 4000);
        }
      }
    };

    const handleOffline = () => {
      setOnline(false);
    };

    const handleQueueUpdate = () => {
      setQueueCount(getOfflineQueue().length);
    };

    const handleCacheHit = (e) => {
      const url = e.detail?.url || "";
      setOfflineCacheNotice(`Offline cache active for recent data`);
      setTimeout(() => setOfflineCacheNotice(null), 5000);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("offline-queue-updated", handleQueueUpdate);
    window.addEventListener("app-offline-cache-hit", handleCacheHit);

    // Initial check on load
    if (isAppOnline() && getOfflineQueue().length > 0) {
      handleOnline();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("offline-queue-updated", handleQueueUpdate);
      window.removeEventListener("app-offline-cache-hit", handleCacheHit);
    };
  }, []);

  const handleManualSync = async () => {
    if (!online || isSyncing) return;
    setIsSyncing(true);
    const result = await syncOfflineQueue();
    setIsSyncing(false);
    setQueueCount(getOfflineQueue().length);
    if (result.synced > 0) {
      setSyncSuccessMsg(`Synced ${result.synced} offline action(s)!`);
      setTimeout(() => setSyncSuccessMsg(""), 4000);
    }
  };

  // Only render when offline, or when syncing, or when there are queued items or success notice
  const shouldShow = !online || queueCount > 0 || isSyncing || syncSuccessMsg || offlineCacheNotice;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-0 inset-x-0 z-50 flex items-center justify-center pointer-events-none p-2"
        >
          <div className="pointer-events-auto flex items-center gap-3 px-4 py-2 rounded-2xl shadow-2xl backdrop-blur-md border text-xs font-semibold max-w-lg w-full justify-between transition-colors bg-slate-900/95 border-slate-700 text-white">
            
            <div className="flex items-center gap-2.5 min-w-0">
              {!online ? (
                <div className="flex items-center gap-2 text-amber-400">
                  <WifiOff className="h-4 w-4 shrink-0 animate-pulse text-rose-400" />
                  <span className="font-bold">Offline Field Mode Active</span>
                </div>
              ) : isSyncing ? (
                <div className="flex items-center gap-2 text-indigo-400">
                  <RefreshCw className="h-4 w-4 shrink-0 animate-spin" />
                  <span>Syncing {queueCount} offline action(s)...</span>
                </div>
              ) : syncSuccessMsg ? (
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{syncSuccessMsg}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-300">
                  <HardDrive className="h-4 w-4 shrink-0 text-indigo-400" />
                  <span className="truncate">{offlineCacheNotice || `${queueCount} action(s) saved locally`}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {queueCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
                  {queueCount} Queued
                </span>
              )}

              {online && queueCount > 0 && !isSyncing && (
                <button
                  type="button"
                  onClick={handleManualSync}
                  className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold uppercase tracking-wider transition cursor-pointer shadow-sm flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Sync Now</span>
                </button>
              )}
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
