import { useState, useRef } from "react";

const ChatInput = ({ chat, onSendMessage, onSendMedia }) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  // Attachment state
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [caption, setCaption] = useState("");
  const fileInputRef = useRef(null);

  const handleTextSend = async () => {
    if (!message.trim() || sending) return;

    const textToSend = message.trim();
    setMessage("");
    setSendError("");
    setSending(true);

    try {
      if (onSendMessage && chat) {
        await onSendMessage(chat, textToSend);
      }
    } catch (err) {
      console.error("Error sending message:", err);
      const errorDetail =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to send message via WhatsApp Meta API.";
      setSendError(errorDetail);
      setMessage(textToSend); // Retain unsent message
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setSendError("File size exceeds the 50MB WhatsApp limit.");
      return;
    }

    setSelectedFile(file);
    setCaption(message); // prefill caption if text was typed
    setSendError("");

    if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
      const previewUrl = URL.createObjectURL(file);
      setFilePreview({ url: previewUrl, type: file.type });
    } else {
      setFilePreview({ url: "", type: file.type });
    }

    // Reset native input so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const cancelAttachment = () => {
    if (filePreview?.url && filePreview.url.startsWith("blob:")) {
      URL.revokeObjectURL(filePreview.url);
    }
    setSelectedFile(null);
    setFilePreview(null);
    setCaption("");
  };

  const handleMediaSend = async () => {
    if (!selectedFile || sending) return;

    setSending(true);
    setSendError("");

    try {
      if (onSendMedia && chat) {
        await onSendMedia(chat, selectedFile, caption);
      }
      cancelAttachment();
      setMessage("");
    } catch (err) {
      console.error("Error sending media attachment:", err);
      const errorDetail =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to upload and send attachment via WhatsApp.";
      setSendError(errorDetail);
    } finally {
      setSending(false);
    }
  };

  const getFileSizeFormatted = (bytes) => {
    if (!bytes) return "";
    if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  return (
    <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 relative">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
        className="hidden"
      />

      {/* Error Alert */}
      {sendError && (
        <div className="mb-3 flex items-start justify-between gap-2 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="font-bold">⚠️ Send Failed:</span>
            <span>{sendError}</span>
          </div>
          <button
            onClick={() => setSendError("")}
            className="text-red-500 hover:text-red-700 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Media Attachment Preview Modal */}
      {selectedFile && (
        <div className="mb-3 p-3.5 bg-slate-50 dark:bg-slate-800/90 rounded-2xl border border-indigo-200 dark:border-indigo-900 shadow-lg animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              📎 Attachment Preview ({getFileSizeFormatted(selectedFile.size)})
            </span>
            <button
              onClick={cancelAttachment}
              disabled={sending}
              className="text-slate-400 hover:text-rose-500 font-bold text-sm cursor-pointer transition"
            >
              ✕ Cancel
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center">
            {/* Thumbnail Preview */}
            <div className="w-full sm:w-28 h-24 rounded-xl bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-300 dark:border-slate-600">
              {filePreview?.type?.startsWith("image/") && (
                <img
                  src={filePreview.url}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              )}
              {filePreview?.type?.startsWith("video/") && (
                <video
                  src={filePreview.url}
                  className="w-full h-full object-cover"
                />
              )}
              {filePreview?.type?.startsWith("audio/") && (
                <div className="text-2xl">🎙️</div>
              )}
              {!filePreview?.type?.startsWith("image/") &&
                !filePreview?.type?.startsWith("video/") &&
                !filePreview?.type?.startsWith("audio/") && (
                  <div className="text-2xl">
                    {selectedFile.name.toLowerCase().endsWith(".pdf") ? "📄" : "📁"}
                  </div>
                )}
            </div>

            {/* File Info & Caption Input */}
            <div className="flex-1 w-full space-y-2">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                {selectedFile.name}
              </p>
              <div className="flex gap-2">
                <input
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleMediaSend()}
                  placeholder="Add a caption (optional)..."
                  disabled={sending}
                  className="flex-1 rounded-xl bg-white dark:bg-slate-900 px-4 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none border border-slate-200 dark:border-slate-700 focus:border-indigo-500 transition disabled:opacity-50"
                />
                <button
                  onClick={handleMediaSend}
                  disabled={sending}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 px-4 py-2 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                >
                  {sending ? (
                    <>
                      <span className="animate-spin text-xs">⏳</span> Sending...
                    </>
                  ) : (
                    <>
                      <span>📤</span> Send
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Input Bar */}
      <div className="flex items-center gap-2.5">
        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={sending}
          className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer disabled:opacity-50 flex-shrink-0"
          title="Attach Photo, Video, or Document"
        >
          📎
        </button>

        <input
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (sendError) setSendError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleTextSend()}
          placeholder="Type a message..."
          disabled={sending}
          className="flex-1 rounded-full bg-slate-100 dark:bg-slate-800 px-5 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none border border-slate-200 dark:border-slate-700 focus:border-indigo-500 transition disabled:opacity-50"
        />

        <button
          onClick={handleTextSend}
          disabled={sending || !message.trim()}
          className="rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 px-6 py-3 text-white font-bold text-sm shadow-md transition cursor-pointer flex-shrink-0"
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default ChatInput;