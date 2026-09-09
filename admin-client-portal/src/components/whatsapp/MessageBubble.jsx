import { useState } from "react";
import WhatsAppVoicePlayer from "./WhatsAppVoicePlayer";
import { CornerUpLeft, Check, CheckCheck, Clock, AlertTriangle, Download, Maximize2, X } from "lucide-react";

const MessageBubble = ({ message, onReply }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [reactions, setReactions] = useState(message.reactions || []);
  const [showReactionPicker, setShowReactionPicker] = useState(false);

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
    : "MAARAN Admin";

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

  // Voice note detection
  const isVoiceNote =
    msgType === "audio" ||
    (message.text && message.text.toLowerCase().includes("voice note")) ||
    (message.media?.fileName && message.media.fileName.endsWith(".mp3"));

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

  const availableReactions = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

  const handleAddReaction = (emoji) => {
    setReactions((prev) => {
      const existing = prev.find((r) => r.emoji === emoji);
      if (existing) {
        return prev.map((r) =>
          r.emoji === emoji ? { ...r, count: r.count + 1 } : r
        );
      }
      return [...prev, { emoji, count: 1 }];
    });
    setShowReactionPicker(false);
  };

  // Document detection
  const isDoc =
    msgType === "document" ||
    msgType === "pdf" ||
    (fileName && (fileName.toLowerCase().endsWith(".pdf") || fileName.toLowerCase().endsWith(".docx") || fileName.toLowerCase().endsWith(".xlsx") || fileName.toLowerCase().endsWith(".txt") || fileName.toLowerCase().endsWith(".zip"))) ||
    (message.text && message.text.toLowerCase().includes("[document"));

  // Sticker detection
  const isSticker = msgType === "sticker" || (message.text && message.text.toLowerCase().includes("[sticker]"));

  let cleanText = displayText;
  if (!cleanText && !hasValidUrl && !isDoc && !isVoiceNote && !isSticker && msgType !== "image" && msgType !== "video") {
    cleanText = message.text && !message.text.startsWith("[") ? message.text : "";
  }

  const renderStatusTicks = () => {
    if (isCustomer) return null;

    switch (message.status) {
      case "read":
        return (
          <span className="text-[#53bdeb] font-black text-xs flex items-center ml-1" title="Read">
            <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb]" />
          </span>
        );
      case "delivered":
        return (
          <span className="text-slate-400 font-bold text-xs flex items-center ml-1" title="Delivered">
            <CheckCheck className="h-3.5 w-3.5 text-slate-400" />
          </span>
        );
      case "sent":
        return (
          <span className="text-slate-400 text-xs flex items-center ml-1" title="Sent">
            <Check className="h-3.5 w-3.5 text-slate-400" />
          </span>
        );
      case "failed":
        return (
          <span className="text-rose-500 font-bold text-xs flex items-center ml-1 cursor-help" title={message.errorDetails?.message || "Delivery failed: Meta 24-hour customer window expired (customer must send a message first to reopen the conversation window)."}>
            <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
          </span>
        );
      default:
        return (
          <span className="text-slate-400 text-[10px] ml-1 opacity-70" title="Sending">
            <Clock className="h-3 w-3 text-slate-400" />
          </span>
        );
    }
  };

  return (
    <>
      <div
        className={`flex group relative mb-3.5 select-text ${
          isCustomer ? "justify-start" : "justify-end"
        }`}
      >
        {/* Floating Quick Reaction & Reply Bar on Hover */}
        <div
          className={`absolute -top-7 z-20 hidden group-hover:flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-full shadow-lg transition-all ${
            isCustomer ? "left-2" : "right-2"
          }`}
        >
          {availableReactions.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleAddReaction(emoji)}
              className="hover:scale-125 transition-transform text-sm px-1 cursor-pointer"
            >
              {emoji}
            </button>
          ))}

          {onReply && (
            <button
              type="button"
              onClick={() => onReply(message)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-500 dark:text-slate-300 rounded-full transition ml-1"
              title="Reply / Quote message"
            >
              <CornerUpLeft className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* WhatsApp Chat Bubble */}
        <div
          className={`max-w-[85%] sm:max-w-[72%] md:max-w-[65%] shadow-sm text-sm border transition-all relative overflow-hidden ${
            isCustomer
              ? "bg-white dark:bg-[#202c33] text-slate-900 dark:text-[#e9edef] border-slate-200/80 dark:border-[#222e35] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl rounded-tl-xs"
              : "bg-[#d9fdd3] dark:bg-[#005c4b] text-slate-900 dark:text-[#e9edef] border-emerald-200/60 dark:border-emerald-800/40 rounded-tl-2xl rounded-bl-2xl rounded-br-2xl rounded-tr-xs"
          }`}
        >
          {/* Quoted Message (if replied) */}
          {message.quotedMessage && (
            <div className="mx-2 mt-2 p-2 rounded-lg bg-black/5 dark:bg-black/20 border-l-4 border-emerald-500 text-xs text-slate-600 dark:text-slate-300">
              <span className="font-bold block text-emerald-700 dark:text-emerald-400">
                {message.quotedMessage.sender || "Message"}
              </span>
              <p className="line-clamp-1 opacity-90">{message.quotedMessage.text}</p>
            </div>
          )}

          {/* Sender Header */}
          {isCustomer && (
            <div className="px-3 pt-2 pb-0.5 flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wide">
                {senderName}
              </span>
            </div>
          )}

          {/* 1. Sticker Rendering */}
          {isSticker && (
            <div className="p-2 flex items-center justify-center">
              {hasValidUrl ? (
                <img
                  src={rawUrl}
                  alt="Sticker"
                  className="w-32 h-32 object-contain hover:scale-105 transition"
                />
              ) : (
                <div className="flex items-center gap-2 p-3 bg-black/5 dark:bg-white/5 rounded-2xl text-xs font-semibold">
                  <span className="text-2xl">🏷️</span>
                  <span>WhatsApp Sticker</span>
                </div>
              )}
            </div>
          )}

          {/* 2. Image Rendering */}
          {msgType === "image" && !isSticker && (
            <div className="p-1.5">
              {hasValidUrl ? (
                <div className="relative group/media overflow-hidden rounded-xl bg-black/5 dark:bg-white/5">
                  {!imageLoaded && (
                    <div className="w-full h-48 animate-pulse bg-slate-200 dark:bg-slate-700 rounded-xl flex items-center justify-center text-xs text-slate-400">
                      Loading site photo...
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
                    className="absolute bottom-2 right-2 bg-black/65 hover:bg-black/85 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1 opacity-0 group-hover/media:opacity-100 transition cursor-pointer"
                  >
                    <Maximize2 className="h-3 w-3" />
                    <span>View</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 p-3 bg-black/5 dark:bg-white/5 rounded-xl text-xs">
                  <span className="text-xl">📷</span>
                  <div className="truncate">
                    <p className="font-bold truncate">{fileName || "WhatsApp Photo"}</p>
                    <p className="text-[10px] text-slate-500">Site Inspection Photo</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. Video Rendering */}
          {msgType === "video" && (
            <div className="p-1.5">
              {hasValidUrl ? (
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
              ) : (
                <div className="flex items-center gap-2.5 p-3 bg-black/5 dark:bg-white/5 rounded-xl text-xs">
                  <span className="text-xl">🎥</span>
                  <div className="truncate">
                    <p className="font-bold truncate">{fileName || "WhatsApp Video"}</p>
                    <p className="text-[10px] text-slate-500">Site Video Recording</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. Voice Note / Audio Rendering */}
          {isVoiceNote && (
            <div className="p-1.5">
              <WhatsAppVoicePlayer
                audioUrl={hasValidUrl ? rawUrl : ""}
                isCustomer={isCustomer}
                time={time}
                senderName={senderName}
              />
            </div>
          )}

          {/* 5. Document / PDF Rendering (ALWAYS VISIBLE!) */}
          {isDoc && (
            <div className="p-2">
              <div className="p-3 rounded-xl bg-black/5 dark:bg-black/20 border border-slate-200/50 dark:border-slate-700/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-lg shrink-0">
                  {fileName.toLowerCase().endsWith(".pdf") ? "📄" : fileName.toLowerCase().endsWith(".xls") || fileName.toLowerCase().endsWith(".xlsx") ? "📊" : "📁"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {fileName && fileName !== "Attachment" ? fileName : message.text?.replace(/^\[Document:\s*|\]$/gi, "") || "Document"}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {fileSize ? fileSize : "WhatsApp Attachment"}
                  </p>
                </div>
                {hasValidUrl && (
                  <a
                    href={rawUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={fileName}
                    className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition shrink-0"
                    title="Download / View"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* 6. Text / Caption */}
          {cleanText && (
            <div className="px-3.5 py-1.5">
              <p className="whitespace-pre-wrap leading-relaxed break-words text-[13.5px]">
                {cleanText}
              </p>
            </div>
          )}

          {/* Time & Delivery Status Footer */}
          <div className="px-3 pb-1.5 pt-0.5 flex items-center justify-end gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">
            <span>{time}</span>
            {renderStatusTicks()}
          </div>
        </div>

        {/* Reaction Badges attached to bubble */}
        {reactions.length > 0 && (
          <div
            className={`absolute -bottom-2.5 flex items-center gap-1 z-10 ${
              isCustomer ? "left-4" : "right-4"
            }`}
          >
            {reactions.map((r, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs shadow-md"
              >
                <span>{r.emoji}</span>
                {r.count > 1 && (
                  <span className="text-[10px] font-bold text-slate-500">{r.count}</span>
                )}
              </span>
            ))}
          </div>
        )}
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
              className="absolute -top-10 right-0 text-white hover:text-rose-400 font-bold text-sm cursor-pointer p-1 flex items-center gap-1"
            >
              <X className="h-5 w-5" />
              <span>Close</span>
            </button>

            <img
              src={rawUrl}
              alt="Full Site Inspection Preview"
              className="max-h-[80vh] max-w-full rounded-2xl shadow-2xl object-contain"
            />

            <div className="mt-3 flex items-center gap-3">
              <a
                href={rawUrl}
                target="_blank"
                rel="noopener noreferrer"
                download={fileName}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span>Download High-Res</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MessageBubble;