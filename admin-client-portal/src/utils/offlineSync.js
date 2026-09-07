import API from "../services/api";

const QUEUE_KEY = "OFFLINE_SYNC_QUEUE";

// Retrieve the queue
export const getOfflineQueue = () => {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY)) || [];
  } catch (e) {
    return [];
  }
};

// Save the queue
const saveQueue = (queue) => {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("offline-queue-updated", { detail: { count: queue.length } }));
  }
};

// Clear the queue
export const clearOfflineQueue = () => {
  localStorage.removeItem(QUEUE_KEY);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("offline-queue-updated", { detail: { count: 0 } }));
  }
};

// Check if online
export const isAppOnline = () => {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
};

// Queue an action
export const queueOfflineAction = (action, taskId, payload) => {
  const queue = getOfflineQueue();
  const newAction = {
    id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    action,
    taskId,
    payload,
    timestamp: new Date().toISOString()
  };
  queue.push(newAction);
  saveQueue(queue);
  console.log(`[Offline Sync] Queued action "${action}" for task ${taskId}`);
  return newAction;
};

// Helper to convert base64 to Blob
const base64ToBlob = (base64, mimeType = "image/jpeg") => {
  try {
    const parts = base64.split(",");
    const byteString = atob(parts[1] || parts[0]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeType });
  } catch (e) {
    console.error("[Offline Sync] Failed to convert base64 to Blob:", e);
    return new Blob([], { type: mimeType });
  }
};

// Sync the queue back to backend
export const syncOfflineQueue = async (onProgress = () => {}) => {
  const queue = getOfflineQueue();
  if (queue.length === 0) return { total: 0, synced: 0, failed: 0 };

  console.log(`[Offline Sync] Starting sync for ${queue.length} action(s)`);
  
  const remaining = [];
  let syncedCount = 0;
  let failedCount = 0;
  
  for (const item of queue) {
    try {
      onProgress(item.action, "syncing");
      
      const { action, taskId, payload } = item;

      if (action === "updateVisitStatus") {
        await API.put(`/api/tasks/${taskId}/visit-status`, payload);
      } 
      else if (action === "startTask") {
        await API.put(`/api/tasks/${taskId}/start`);
      }
      else if (action === "updateTaskProgress") {
        await API.put(`/api/tasks/${taskId}/progress`, payload);
      }
      else if (action === "addNote") {
        await API.post(`/api/tasks/${taskId}/notes`, payload);
      } 
      else if (action === "addMaterial") {
        await API.put(`/api/tasks/${taskId}/materials`, payload);
      } 
      else if (action === "submitSignOff") {
        await API.put(`/api/tasks/${taskId}/sign-off`, payload);
      } 
      else if (action === "uploadAttachment") {
        const { files } = payload || {}; // Array of { name, type, base64 }
        if (Array.isArray(files) && files.length > 0) {
          const formData = new FormData();
          files.forEach(f => {
            const blob = base64ToBlob(f.base64, f.type);
            const file = new File([blob], f.name || "offline-photo.jpg", { type: f.type || "image/jpeg" });
            formData.append("files", file);
          });

          await API.put(`/api/tasks/${taskId}/attachment`, formData, {
            headers: {
              "Content-Type": "multipart/form-data"
            }
          });
        }
      }

      console.log(`[Offline Sync] Successfully synced item: ${item.id} (${action})`);
      onProgress(item.action, "success");
      syncedCount++;
    } catch (error) {
      console.error(`[Offline Sync] Failed to sync item ${item.id}:`, error);
      // Keep in queue for retry if it's a network issue or server error
      if (!error.response || error.response.status >= 500) {
        remaining.push(item);
      }
      onProgress(item.action, "error");
      failedCount++;
    }
  }

  saveQueue(remaining);

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("offline-sync-completed", {
        detail: { total: queue.length, synced: syncedCount, remaining: remaining.length }
      })
    );
  }

  return { total: queue.length, synced: syncedCount, failed: failedCount, remaining: remaining.length };
};
