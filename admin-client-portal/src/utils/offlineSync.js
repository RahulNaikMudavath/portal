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
  // Dispatch update event
  window.dispatchEvent(new CustomEvent("offline-queue-updated"));
};

// Check if online
export const isAppOnline = () => {
  return navigator.onLine;
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
};

// Helper to convert base64 to Blob
const base64ToBlob = (base64, mimeType) => {
  const byteString = atob(base64.split(",")[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeType });
};

// Sync the queue back to backend
export const syncOfflineQueue = async (onProgress = () => {}) => {
  const queue = getOfflineQueue();
  if (queue.length === 0) return;

  console.log(`[Offline Sync] Starting sync for ${queue.length} action(s)`);
  
  const remaining = [];
  
  for (const item of queue) {
    try {
      onProgress(item.action, "syncing");
      
      const { action, taskId, payload } = item;

      if (action === "updateVisitStatus") {
        await API.put(`/api/tasks/${taskId}/visit-status`, payload);
      } 
      else if (action === "addNote") {
        await API.post(`/api/tasks/${taskId}/notes`, payload);
      } 
      else if (action === "addMaterial") {
        await API.post(`/api/tasks/${taskId}/materials`, payload);
      } 
      else if (action === "submitSignOff") {
        await API.put(`/api/tasks/${taskId}/sign-off`, payload);
      } 
      else if (action === "uploadAttachment") {
        // payload includes base64 representation of files
        const { files } = payload; // Array of { name, type, base64 }
        const formData = new FormData();
        
        files.forEach(f => {
          const blob = base64ToBlob(f.base64, f.type);
          const file = new File([blob], f.name, { type: f.type });
          formData.append("files", file);
        });

        await API.post(`/api/tasks/${taskId}/attachment`, formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });
      }

      console.log(`[Offline Sync] Successfully synced item: ${item.id}`);
      onProgress(item.action, "success");
    } catch (error) {
      console.error(`[Offline Sync] Failed to sync item ${item.id}:`, error);
      // Keep in queue for retry if it's a network issue
      if (!error.response || error.response.status >= 500) {
        remaining.push(item);
      }
      onProgress(item.action, "error");
    }
  }

  saveQueue(remaining);
};
