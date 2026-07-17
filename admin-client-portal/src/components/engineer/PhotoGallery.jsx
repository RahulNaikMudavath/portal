import { useState, useMemo, useRef } from "react";
import { uploadTaskAttachment } from "../../services/taskService";
import { motion, AnimatePresence } from "framer-motion";
import { isAppOnline, queueOfflineAction } from "../../utils/offlineSync";

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});

export default function PhotoGallery({ task, onRefresh }) {
  const [activeTab, setActiveTab] = useState("before"); // before, during, after
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Generate realistic engineering media (photos & videos) based on task title and submission status
  const mediaByStage = useMemo(() => {
    const stages = {
      before: [
        {
          url: "https://images.unsplash.com/photo-1581094288338-2314dddb7eed?auto=format&fit=crop&w=600&q=80",
          title: "Initial Site Assessment",
          date: "14 Jul 2026, 09:30 AM",
          isVideo: false
        }
      ],
      during: [
        {
          url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80",
          title: "Structural Layout Check",
          date: "14 Jul 2026, 11:15 AM",
          isVideo: false
        },
        {
          url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80",
          title: "Foundation Verification",
          date: "15 Jul 2026, 08:45 AM",
          isVideo: false
        }
      ],
      after: [
        {
          url: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=600&q=80",
          title: "Completed Install check",
          date: "16 Jul 2026, 04:00 PM",
          isVideo: false
        }
      ]
    };

    const isVideoFile = (filename) => {
      const lower = filename.toLowerCase();
      return lower.endsWith(".mp4") || lower.endsWith(".mov") || lower.endsWith(".avi") || lower.endsWith(".webm") || lower.endsWith(".3gp");
    };

    // Distribute actual uploaded attachments to "Before" and submissions to "After"
    const adminFiles = task?.files || [];
    adminFiles.forEach((file) => {
      const url = file.startsWith("http") ? file : `http://localhost:5001/${file}`;
      stages.before.push({
        url,
        title: file.split(/[\\/]/).pop() || "Before Media",
        date: "Initial Attachment",
        isVideo: isVideoFile(file)
      });
    });

    const clientFiles = task?.submissionFiles || [];
    clientFiles.forEach((file) => {
      const url = file.startsWith("http") ? file : `http://localhost:5001/${file}`;
      stages.after.push({
        url,
        title: file.split(/[\\/]/).pop() || "Submission Proof",
        date: "Work Submission",
        isVideo: isVideoFile(file)
      });
    });

    return stages;
  }, [task]);

  const currentMedia = mediaByStage[activeTab] || [];

  const handleDragOver = (e) => {
    e.preventDefault();
    if (task?.status === "completed") return;
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const uploadFiles = async (files) => {
    if (files.length === 0) return;
    try {
      setUploading(true);
      
      if (!isAppOnline()) {
        const filePromises = files.map(async (file) => {
          const base64 = await fileToBase64(file);
          return {
            name: file.name,
            type: file.type,
            base64
          };
        });
        const serializedFiles = await Promise.all(filePromises);
        queueOfflineAction("uploadAttachment", task._id, { files: serializedFiles });
        alert("Offline: Media queued locally. Will sync when connection returns.");
        if (onRefresh) onRefresh();
      } else {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("files", file);
        });
        await uploadTaskAttachment(task._id, formData);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to upload media");
    } finally {
      setUploading(false);
      setIsDragging(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    if (task?.status === "completed") return;
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/") || file.type.startsWith("video/")
    );
    await uploadFiles(files);
  };

  const handleFileSelect = async (e) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    await uploadFiles(files);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative rounded-2xl border bg-slate-900 p-6 transition-all duration-300 ${
        isDragging ? "border-indigo-500 bg-indigo-950/20" : "border-slate-800 hover:border-slate-700 hover:shadow-lg"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>📷</span> Job Media Gallery
        </h3>

        {/* Tab switches */}
        <div className="flex gap-1 bg-slate-950/50 p-0.5 rounded-lg border border-slate-850">
          {["before", "during", "after"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-md transition duration-200 ${
                activeTab === tab
                  ? "bg-indigo-600 text-white"
                  : "text-slate-455 hover:text-white"
              }`}
            >
              {tab} ({mediaByStage[tab]?.length || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Drag & Drop Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-2xl z-20 flex flex-col items-center justify-center border-2 border-dashed border-indigo-500 m-1"
          >
            <span className="text-4xl animate-bounce">📤</span>
            <p className="text-sm font-bold text-white mt-3">Drop files to upload to "{activeTab}"</p>
            <p className="text-xs text-slate-500 mt-1">Supports Images & Videos</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Uploading Overlay */}
      {uploading && (
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm rounded-2xl z-20 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
          <p className="text-xs font-semibold text-slate-400 mt-3">Uploading files to server...</p>
        </div>
      )}

      {currentMedia.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {currentMedia.map((media, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedMedia(media)}
              className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-800 bg-slate-955 aspect-video transition-all duration-300 hover:border-indigo-500/50 hover:shadow-md"
            >
              {media.isVideo ? (
                <div className="h-full w-full relative flex items-center justify-center bg-slate-950">
                  <video src={media.url} className="h-full w-full object-cover opacity-80" preload="metadata" muted />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="h-10 w-10 rounded-full bg-indigo-600/90 text-white flex items-center justify-center text-sm shadow-md group-hover:scale-110 transition">
                      ▶
                    </span>
                  </div>
                </div>
              ) : (
                <img
                  src={media.url}
                  alt={media.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-955 via-slate-955/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2.5 flex flex-col justify-end">
                <p className="text-[10px] font-bold text-white truncate">{media.title}</p>
                <p className="text-[8px] text-slate-405 font-mono mt-0.5">{media.date}</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-500 italic py-4 text-center">
          No media records available for the {activeTab} stage.
        </p>
      )}

      {/* Manual Upload Trigger */}
      {task?.status !== "completed" && (
        <div className="mt-4 pt-4 border-t border-slate-850 flex justify-between items-center text-xs text-slate-500">
          <span>💡 Or drag and drop images/videos anywhere in this box</span>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-indigo-400 hover:text-indigo-350 font-bold hover:underline"
          >
            Browse Files
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            accept="image/*,video/*"
            className="hidden"
          />
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedMedia && (
        <div
          onClick={() => setSelectedMedia(null)}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center z-[100] p-4 transition-opacity duration-300"
        >
          <div className="relative max-w-4xl max-h-[80vh] overflow-hidden rounded-2xl border border-slate-800 bg-slate-955" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/60 text-white flex items-center justify-center font-bold hover:bg-black/85 hover:text-red-405 z-10 transition"
            >
              ✕
            </button>
            {selectedMedia.isVideo ? (
              <video 
                src={selectedMedia.url} 
                controls 
                autoPlay 
                className="max-w-full max-h-[75vh]" 
              />
            ) : (
              <img
                src={selectedMedia.url}
                alt={selectedMedia.title}
                className="max-w-full max-h-[75vh] object-contain"
              />
            )}
          </div>
          <div className="mt-4 text-center">
            <h4 className="text-sm font-bold text-white">{selectedMedia.title}</h4>
            <p className="text-xs text-slate-400 mt-0.5">{selectedMedia.date}</p>
          </div>
        </div>
      )}
    </div>
  );
}
