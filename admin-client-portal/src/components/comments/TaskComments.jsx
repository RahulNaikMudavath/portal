import { useEffect, useRef, useState } from "react";
import {
  addTaskComment,
  getTaskComments,
} from "../../services/commentService";
import socket from "../../socket";
import { Mic, Square, Send, Volume2 } from "lucide-react";

function TaskComments({ taskId }) {
  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [open, setOpen] = useState(false);

  // Voice Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const commentsEndRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await getTaskComments(taskId);
      setComments(response.data);
    } catch (error) {
      console.error("Fetch comments error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && comments.length > 0) {
      commentsEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [comments, open]);

  useEffect(() => {
    if (open) {
      fetchComments();
    }
  }, [open, taskId]);

  useEffect(() => {
    const handleNewTaskComment = (data) => {
      if (data.taskId !== taskId) return;

      setComments((currentComments) => {
        const alreadyExists = currentComments.some(
          (comment) => comment._id === data.comment._id
        );

        if (alreadyExists) return currentComments;

        return [...currentComments, data.comment];
      });
    };

    socket.on("new_task_comment", handleNewTaskComment);

    return () => {
      socket.off("new_task_comment", handleNewTaskComment);
    };
  }, [taskId]);

  // Handle Text Submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!message.trim()) return;

    try {
      setSending(true);
      const response = await addTaskComment(taskId, message.trim());

      setComments((currentComments) => {
        const alreadyExists = currentComments.some(
          (comment) => comment._id === response.data._id
        );
        if (alreadyExists) return currentComments;
        return [...currentComments, response.data];
      });

      setMessage("");
    } catch (error) {
      console.error("Add comment error:", error);
      alert(error.response?.data?.message || "Failed to send comment");
    } finally {
      setSending(false);
    }
  };

  const speechRecognitionRef = useRef(null);

  // Start Voice Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();

        reader.onloadend = async () => {
          const base64Audio = reader.result;
          await sendVoiceComment(base64Audio);
        };

        reader.readAsDataURL(audioBlob);

        // Stop all audio stream tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      // Initialize speech recognition for live auto speech-to-text typing
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;

          recognition.onresult = (event) => {
            let currentTranscript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
              currentTranscript += event.results[i][0].transcript;
            }
            if (currentTranscript.trim()) {
              setMessage(currentTranscript.trim());
            }
          };

          recognition.start();
          speechRecognitionRef.current = recognition;
        } catch (e) {
          console.warn("Speech recognition error:", e);
        }
      }

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
      alert("Could not access microphone. Please check browser permissions.");
    }
  };

  // Stop Voice Recording
  const stopRecording = () => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  // Send Voice Comment to Server
  const sendVoiceComment = async (base64Audio) => {
    try {
      setSending(true);
      const textPayload = message.trim() ? `🎤 ${message.trim()}` : "🎤 Voice Note";
      const response = await addTaskComment(taskId, textPayload, base64Audio);

      setComments((currentComments) => {
        const alreadyExists = currentComments.some(
          (comment) => comment._id === response.data._id
        );
        if (alreadyExists) return currentComments;
        return [...currentComments, response.data];
      });
      setMessage("");
    } catch (error) {
      console.error("Failed to send voice comment:", error);
      alert("Failed to upload voice note.");
    } finally {
      setSending(false);
      setRecordingTime(0);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="mt-5 rounded-xl border border-slate-700 bg-slate-950/40">
      <button
        onClick={() => setOpen((currentOpen) => !currentOpen)}
        className="flex w-full items-center justify-between px-4 py-3 text-left cursor-pointer"
      >
        <span className="font-semibold text-white flex items-center gap-2">
          <span>💬 Task Discussion</span>
          {comments.length > 0 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
              {comments.length}
            </span>
          )}
        </span>

        <span className="text-sm font-semibold text-slate-400">
          {open ? "Hide" : "Open"}
        </span>
      </button>

      {open && (
        <div className="border-t border-slate-700 p-4 space-y-4">
          {loading ? (
            <p className="text-sm text-slate-400 animate-pulse">Loading discussion...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-slate-400">
              No comments yet. Start the discussion or send a voice note.
            </p>
          ) : (
            <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
              {comments.map((comment) => {
                const senderId = comment.sender?._id || comment.sender?.id;
                const isMyComment = String(senderId) === String(user._id || user.id);

                return (
                  <div
                    key={comment._id}
                    className={`rounded-xl p-3 shadow-sm ${
                      isMyComment
                        ? "ml-6 bg-indigo-600/20 border border-indigo-500/30"
                        : "mr-6 bg-slate-800/90 border border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-white flex items-center gap-1.5">
                        <span>{comment.sender?.name || "User"}</span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                          {comment.sender?.role || "user"}
                        </span>
                      </p>

                      <span className="text-[11px] text-slate-400 font-medium">
                        {new Date(comment.createdAt).toLocaleString("en-IN", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>

                    <p className="mt-1.5 break-words text-sm text-slate-200">
                      {comment.message}
                    </p>

                    {/* Voice Note Player Control */}
                    {comment.audioUrl && (
                      <div className="mt-2 p-2 rounded-lg bg-slate-900/90 border border-slate-700/80 flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                          <Volume2 className="h-4 w-4 animate-bounce" />
                          <span>Voice Recording Note</span>
                        </div>
                        <audio
                          controls
                          src={comment.audioUrl}
                          className="w-full h-8 rounded"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={commentsEndRef} />
            </div>
          )}

          {/* Voice & Text Input Toolbar */}
          <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2">
            {isRecording ? (
              <div className="flex-1 flex items-center justify-between px-4 py-2 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-300 animate-pulse">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <div className="h-3 w-3 rounded-full bg-rose-500 animate-ping" />
                  <span>Recording Voice Note... ({formatTimer(recordingTime)})</span>
                </div>
                <button
                  type="button"
                  onClick={stopRecording}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer shadow-md"
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                  <span>Send Recording</span>
                </button>
              </div>
            ) : (
              <>
                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Write a message or record voice..."
                  className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-500 transition"
                />

                {/* Microphone Record Button */}
                <button
                  type="button"
                  onClick={startRecording}
                  disabled={sending}
                  title="Record Voice Note"
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 border border-slate-700 transition cursor-pointer disabled:opacity-50"
                >
                  <Mic className="h-4 w-4" />
                </button>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={sending || !message.trim()}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-md"
                >
                  <Send className="h-4 w-4" />
                  <span>{sending ? "Sending..." : "Send"}</span>
                </button>
              </>
            )}
          </form>
        </div>
      )}
    </div>
  );
}

export default TaskComments;