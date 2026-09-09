import { useState, useRef, useEffect } from "react";
import { Smile, Paperclip, Send, Mic, Zap, Trash2, X, CornerUpLeft } from "lucide-react";
import QuickRepliesModal from "./QuickRepliesModal";
import EmojiPickerPopover from "./EmojiPickerPopover";

const ChatInput = ({ chat, replyingTo, onCancelReply, onSendMessage, onSendMedia }) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  // Attachment state
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [caption, setCaption] = useState("");
  const fileInputRef = useRef(null);

  // Popover states
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Voice Note Recording Simulation
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordIntervalRef = useRef(null);

  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      recordIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    }
    return () => {
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    };
  }, [isRecording]);

  const handleTextSend = async () => {
    if (!message.trim() || sending) return;

    const textToSend = message.trim();
    setMessage("");
    setSendError("");
    setSending(true);

    try {
      if (onSendMessage && chat) {
        await onSendMessage(chat, textToSend, replyingTo);
      }
      if (onCancelReply) onCancelReply();
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

    if (file.size > 50 * 1024 * 1024) {
      setSendError("File size exceeds the 50MB WhatsApp limit.");
      return;
    }

    setSelectedFile(file);
    setCaption(message);
    setSendError("");

    if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
      const previewUrl = URL.createObjectURL(file);
      setFilePreview({ url: previewUrl, type: file.type });
    } else {
      setFilePreview({ url: "", type: file.type });
    }

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
      if (onCancelReply) onCancelReply();
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

  const handleSendVoiceNote = async () => {
    setIsRecording(false);
    if (recordingSeconds < 1) return;

    const voiceNoteUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
    try {
      setSending(true);
      if (onSendMessage && chat) {
        await onSendMessage(
          chat,
          `[Voice Note: ${recordingSeconds}s]`,
          replyingTo
        );
      }
      if (onCancelReply) onCancelReply();
    } catch (err) {
      console.error("Voice note error:", err);
    } finally {
      setSending(false);
    }
  };

  const handleSelectTemplate = (templateText) => {
    setMessage(templateText);
  };

  const handleSelectEmoji = (emoji) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const getFileSizeFormatted = (bytes) => {
    if (!bytes) return "";
    if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  return (
    <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#202c33] p-3 sm:p-4 relative select-none">
      {/* Hidden Native File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
        className="hidden"
      />

      {/* Quoted Message Preview Bar */}
      {replyingTo && (
        <div className="mb-2.5 p-2.5 bg-slate-50 dark:bg-slate-800/90 rounded-2xl border-l-4 border-emerald-500 flex items-center justify-between shadow-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2 overflow-hidden text-xs">
            <CornerUpLeft className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="truncate">
              <span className="font-bold text-emerald-700 dark:text-emerald-400 block text-[11px]">
                Replying to {replyingTo.sender || (replyingTo.direction === "incoming" ? "Customer" : "Admin")}
              </span>
              <p className="text-slate-600 dark:text-slate-300 truncate">
                {replyingTo.text || "[Attachment]"}
              </p>
            </div>
          </div>
          <button
            onClick={onCancelReply}
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Error Alert */}
      {sendError && (
        <div className="mb-3 flex items-start justify-between gap-2 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="font-bold">⚠️ Send Error:</span>
            <span>{sendError}</span>
          </div>
          <button
            onClick={() => setSendError("")}
            className="text-rose-500 hover:text-rose-700 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Media Attachment Preview Box */}
      {selectedFile && (
        <div className="mb-3 p-3.5 bg-slate-50 dark:bg-slate-800/90 rounded-2xl border border-emerald-200 dark:border-emerald-900 shadow-lg animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              📎 Attachment Preview ({getFileSizeFormatted(selectedFile.size)})
            </span>
            <button
              onClick={cancelAttachment}
              disabled={sending}
              className="text-slate-400 hover:text-rose-500 font-bold text-xs cursor-pointer transition"
            >
              ✕ Cancel
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="w-full sm:w-28 h-24 rounded-xl bg-slate-200 dark:bg-slate-700 shrink-0 flex items-center justify-center overflow-hidden border border-slate-300 dark:border-slate-600">
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
                  className="flex-1 rounded-xl bg-white dark:bg-slate-900 px-4 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none border border-slate-200 dark:border-slate-700 focus:border-emerald-500 transition disabled:opacity-50"
                />
                <button
                  onClick={handleMediaSend}
                  disabled={sending}
                  className="rounded-xl bg-[#00a884] hover:bg-[#008f6f] disabled:bg-emerald-400 px-4 py-2 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main WhatsApp Action Input Bar */}
      {isRecording ? (
        /* Live Voice Recording UI */
        <div className="flex items-center justify-between gap-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 p-2.5 rounded-full animate-in fade-in duration-150">
          <div className="flex items-center gap-3 pl-3">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping shrink-0" />
            <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
              Recording Voice Note {formatTimer(recordingSeconds)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRecording(false)}
              className="p-2 rounded-full hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-500 transition cursor-pointer"
              title="Cancel recording"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={handleSendVoiceNote}
              className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Send Audio</span>
            </button>
          </div>
        </div>
      ) : (
        /* Standard Message Typing Controls */
        <div className="flex items-center gap-1.5 sm:gap-2 relative">
          {/* Emoji Picker Popover Toggle */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={sending}
            className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition cursor-pointer shrink-0"
            title="Insert Emoji"
          >
            <Smile className="h-5 w-5" />
          </button>

          {/* Quick Replies Template Shortcut */}
          <button
            type="button"
            onClick={() => setShowQuickReplies(true)}
            disabled={sending}
            className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer shrink-0"
            title="Quick Construction Responses (Templates)"
          >
            <Zap className="h-5 w-5" />
          </button>

          {/* Media Attachment Clip */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending}
            className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer shrink-0"
            title="Attach Photo, Video, or Document"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          {/* Text Input */}
          <input
            value={message}
            onChange={(e) => {
              const val = e.target.value;
              setMessage(val);
              if (val === "/") {
                setShowQuickReplies(true);
              }
              if (sendError) setSendError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleTextSend();
              }
            }}
            placeholder="Type a message (or type '/' for templates)..."
            disabled={sending}
            className="flex-1 rounded-full bg-slate-100 dark:bg-[#2a3942] px-5 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 dark:text-[#d1d7db] placeholder:text-slate-400 dark:placeholder:text-[#8696a0] outline-none border border-transparent focus:border-emerald-500 transition disabled:opacity-50"
          />

          {/* Send or Voice Record Button */}
          {message.trim().length > 0 ? (
            <button
              onClick={handleTextSend}
              disabled={sending}
              className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#008f6f] disabled:bg-emerald-400 flex items-center justify-center text-white shadow-md transition active:scale-95 cursor-pointer shrink-0"
              title="Send WhatsApp Message"
            >
              <Send className="h-4 w-4 ml-0.5" />
            </button>
          ) : (
            <button
              onClick={() => setIsRecording(true)}
              className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#2a3942] hover:bg-emerald-500 hover:text-white text-slate-500 dark:text-slate-300 flex items-center justify-center shadow-xs transition active:scale-95 cursor-pointer shrink-0"
              title="Record Voice Note"
            >
              <Mic className="h-4 w-4" />
            </button>
          )}

          {/* Popovers */}
          <EmojiPickerPopover
            isOpen={showEmojiPicker}
            onClose={() => setShowEmojiPicker(false)}
            onSelectEmoji={handleSelectEmoji}
          />
        </div>
      )}

      {/* Quick Replies Dialog */}
      <QuickRepliesModal
        isOpen={showQuickReplies}
        onClose={() => setShowQuickReplies(false)}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
};

export default ChatInput;