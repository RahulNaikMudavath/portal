import { useState } from "react";

const MessageBubble = ({ message }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const isCustomer =
    message.direction === "incoming" ||
    message.type === "incoming" ||
    message.sender === "Customer";

  const time =
    message.time ||
    (message.createdAt
      ? new Date(message.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "");

  const senderName = isCustomer
    ? message.customerName || "Customer"
    : "Admin";

  const rawUrl = message.media?.url || message.mediaUrl || "";
  const hasValidUrl =
    typeof rawUrl === "string" &&
    (rawUrl.startsWith("http://") ||
      rawUrl.startsWith("https://") ||
      rawUrl.startsWith("blob:") ||
      rawUrl.startsWith("data:"));

  let msgType = message.messageType || "text";
  if (msgType === "text" && hasValidUrl) {
    if (message.media?.mimeType?.startsWith("image/")) msgType = "image";
    else if (message.media?.mimeType?.startsWith("video/")) msgType = "video";
    else if (message.media?.mimeType?.startsWith("audio/")) msgType = "audio";
    else msgType = "document";
  }

  const fileName = message.media?.fileName || message.fileName || "Attachment";
  const fileSize = message.media?.fileSize
    ? message.media.fileSize > 1024 * 1024
      ? `${(message.media.fileSize / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(message.media.fileSize / 1024)} KB`
    : "";

  // Filter out placeholder text like "[Image]" if caption is not provided
  const displayText =
    message.text &&
    !message.text.match(/^\[(Image|Video|Audio|Document|PDF)(:.*)?\]$/i)
      ? message.text
      : "";

  const renderStatusTicks = () => {
    if (isCustomer) return null;

    switch (message.status) {
      case "read":
        return (
          <span className="text-sky-300 font-bold ml-1 text-xs" title="Read">
            ✓✓
          </span>
        );
      case "delivered":
        return (
          <span className="text-slate-300 font-bold ml-1 text-xs" title="Delivered">
            ✓✓
          </span>
        );
      case "sent":
        return (
          <span className="text-slate-300 font-medium ml-1 text-xs" title="Sent">
            ✓
          </span>
        );
      case "failed":
        return (
          <span className="text-rose-300 font-bold ml-1 text-xs" title="Failed to deliver">
            ⚠️
          </span>
        );
      default:
        return (
          <span className="text-slate-300 text-[10px] ml-1 opacity-70" title="Sending">
            🕒
          </span>
        );
    }
  };

  return (
    <>
      <div
        className={`flex mb-3.5 ${
          isCustomer ? "justify-start" : "justify-end"
        }`}
      >
        <div
          className={`max-w-[82%] sm:max-w-[70%] md:max-w-[62%] rounded-2xl shadow-sm text-sm border transition-all overflow-hidden ${
            isCustomer
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700/70 rounded-bl-xs"
              : "bg-indigo-600 dark:bg-indigo-600 text-white border-indigo-700 dark:border-indigo-500 rounded-br-xs shadow-md"
          }`}
        >
          {/* Sender Header */}
          <div className="px-3.5 pt-2.5 pb-1 flex items-center justify-between gap-2 border-b border-black/5 dark:border-white/5">
            <span className="text-[11px] font-bold tracking-wide opacity-80 truncate">
              {senderName}
            </span>
          </div>

          {/* Media Content Renderers */}
          {hasValidUrl && (
            <div className="p-1.5">
              {/* Image Message */}
              {msgType === "image" && (
                <div className="relative group overflow-hidden rounded-xl bg-black/5 dark:bg-white/5">
                  {!imageLoaded && (
                    <div className="w-full h-48 animate-pulse bg-slate-200 dark:bg-slate-700 rounded-xl flex items-center justify-center text-xs text-slate-400">
                      Loading photo...
                    </div>
                  )}
                  <img
                    src={rawUrl}
                    alt={fileName || "WhatsApp Image"}
                    onLoad={() => setImageLoaded(true)}
                    onClick={() => setLightboxOpen(true)}
                    className={`w-full max-h-72 object-cover rounded-xl cursor-pointer hover:scale-[1.01] transition duration-200 ${
                      imageLoaded ? "block" : "hidden"
                    }`}
                  />
                  <button
                    onClick={() => setLightboxOpen(true)}
                    className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition"
                  >
                    🔍 View Full
                  </button>
                </div>
              )}

              {/* Video Message */}
              {msgType === "video" && (
                <div className="rounded-xl overflow-hidden bg-black/10 dark:bg-black/30">
                  <video
                    src={rawUrl}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full max-h-72 rounded-xl bg-black"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}

              {/* Audio Message */}
              {msgType === "audio" && (
                <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 flex flex-col gap-1.5 min-w-[240px]">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <span>🎙️ Voice Note</span>
                    {fileSize && <span className="opacity-70 text-[10px]">({fileSize})</span>}
                  </div>
                  <audio
                    src={rawUrl}
                    controls
                    preload="metadata"
                    className="w-full h-9 rounded-lg"
                  >
                    Your browser does not support audio playback.
                  </audio>
                </div>
              )}

              {/* Document / PDF Message */}
              {(msgType === "document" || msgType === "pdf") && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {fileName.toLowerCase().endsWith(".pdf") ? "📄" : "📁"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {fileName}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {fileSize ? fileSize : "Document"}
                    </p>
                  </div>
                  <a
                    href={rawUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={fileName}
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition flex-shrink-0"
                    title="Download / View"
                  >
                    ⬇️
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Text / Caption */}
          {displayText && (
            <div className="px-3.5 py-2">
              <p className="whitespace-pre-wrap leading-relaxed break-words text-sm">
                {displayText}
              </p>
            </div>
          )}

          {/* Time & Delivery Status Footer */}
          <div className="px-3 pb-1.5 pt-0.5 flex items-center justify-end gap-1 text-[10px] font-medium opacity-70">
            <span>{time}</span>
            {renderStatusTicks()}
          </div>
        </div>
      </div>

      {/* Interactive Lightbox Modal */}
      {lightboxOpen && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute -top-10 right-0 text-white hover:text-rose-400 font-bold text-xl cursor-pointer p-1"
            >
              ✕ Close
            </button>

            <img
              src={rawUrl}
              alt="Full Preview"
              className="max-h-[80vh] max-w-full rounded-2xl shadow-2xl object-contain"
            />

            <div className="mt-3 flex items-center gap-3">
              <a
                href={rawUrl}
                target="_blank"
                rel="noopener noreferrer"
                download={fileName}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
              >
                ⬇️ Download High-Res
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MessageBubble;