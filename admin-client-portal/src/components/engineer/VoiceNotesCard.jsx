import { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, Trash2, Upload, Volume2 } from "lucide-react";
import { uploadTaskAttachment } from "../../services/taskService";
import { isAppOnline, queueOfflineAction } from "../../utils/offlineSync";

const audioToBase64 = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});

export default function VoiceNotesCard({ task, onRefresh }) {
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState("");
  const [audioBlob, setAudioBlob] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [uploading, setUploading] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioPlayerRef = useRef(null);

  // Time ticker
  useEffect(() => {
    if (recording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [recording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Start recording
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = { mimeType: "audio/webm" };
      
      let recorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch (e) {
        recorder = new MediaRecorder(stream);
      }
      
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        // Stop stream tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(250); // Slice data every 250ms
      setRecordingTime(0);
      setRecording(true);
      setAudioUrl("");
      setAudioBlob(null);
    } catch (err) {
      console.error("Audio recording permission error:", err);
      alert("Mic permission denied or unavailable on this device.");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  // Toggle playback
  const togglePlay = () => {
    if (!audioPlayerRef.current) return;
    if (playing) {
      audioPlayerRef.current.pause();
      setPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setPlaying(true);
    }
  };

  const handleAudioEnded = () => {
    setPlaying(false);
  };

  // Clear audio
  const discardRecord = () => {
    setAudioUrl("");
    setAudioBlob(null);
    setPlaying(false);
  };

  // Upload Voice Memo
  const uploadVoiceMemo = async () => {
    if (!audioBlob) return;
    try {
      setUploading(true);
      const filename = `voice_memo_${Date.now()}.webm`;
      
      if (!isAppOnline()) {
        const base64 = await audioToBase64(audioBlob);
        const files = [{
          name: filename,
          type: audioBlob.type || "audio/webm",
          base64
        }];
        queueOfflineAction("uploadAttachment", task._id, { files });
        alert("Offline: Voice note saved locally. Syncs automatically when online.");
        discardRecord();
        if (onRefresh) onRefresh();
      } else {
        const formData = new FormData();
        const file = new File([audioBlob], filename, { type: audioBlob.type || "audio/webm" });
        formData.append("files", file);

        await uploadTaskAttachment(task._id, formData);
        discardRecord();
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to upload voice note");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition-all duration-300 hover:border-slate-700 hover:shadow-lg space-y-4">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <span>🎙️</span> On-site Voice Notes
      </h3>

      <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col items-center justify-center min-h-[100px] relative overflow-hidden">
        {recording ? (
          <div className="space-y-3 text-center">
            {/* Pulsing indicator */}
            <div className="flex justify-center items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500 animate-ping"></span>
              <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">Recording Live</span>
            </div>

            {/* Fake wave graphic micro-animation */}
            <div className="flex items-end justify-center gap-0.5 h-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 7, 6, 5, 4, 3, 2, 1].map((h, i) => (
                <div 
                  key={i} 
                  className="w-0.5 bg-rose-500 rounded-full animate-pulse" 
                  style={{ 
                    height: `${h * 3}px`,
                    animationDelay: `${i * 0.08}s`
                  }}
                />
              ))}
            </div>

            <p className="text-2xl font-black font-mono text-white">{formatTime(recordingTime)}</p>
          </div>
        ) : audioUrl ? (
          <div className="w-full space-y-3">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center flex items-center justify-center gap-1">
              <Volume2 className="h-3.5 w-3.5 text-indigo-400" /> Voice Memo Ready
            </p>
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3">
              <button 
                onClick={togglePlay}
                className="h-9 w-9 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs"
              >
                {playing ? <Pause className="h-4.5 w-4.5" /> : <Play className="h-4.5 w-4.5 fill-current" />}
              </button>
              <div className="flex-1">
                <div className="h-1.5 rounded-full bg-slate-950 overflow-hidden">
                  <div className={`h-full bg-indigo-500 ${playing ? "w-full transition-all duration-[10s] linear" : "w-0"}`}></div>
                </div>
              </div>
            </div>
            <audio ref={audioPlayerRef} src={audioUrl} onEnded={handleAudioEnded} className="hidden" />
          </div>
        ) : (
          <div className="text-center text-slate-500 text-xs py-4 space-y-1">
            <p className="font-semibold">No active voice memos recorded</p>
            <p className="text-[10px] text-slate-500">Record audio instructions, notes, or client verbal remarks.</p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        {recording ? (
          <button
            onClick={stopRecording}
            className="flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider w-full py-3 rounded-xl transition shadow-lg"
          >
            <Square className="h-4 w-4" /> Stop & Compile Audio
          </button>
        ) : audioUrl ? (
          <div className="flex w-full gap-3">
            <button
              onClick={discardRecord}
              className="flex items-center justify-center gap-1 bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 px-3.5 py-3 rounded-xl text-xs font-bold uppercase transition"
            >
              <Trash2 className="h-4 w-4" /> Discard
            </button>
            <button
              onClick={uploadVoiceMemo}
              disabled={uploading}
              className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider py-3 rounded-xl transition shadow-md"
            >
              <Upload className="h-4 w-4" /> {uploading ? "Saving Memo..." : "Upload Voice Memo"}
            </button>
          </div>
        ) : (
          <button
            onClick={startRecording}
            className="flex items-center justify-center gap-1.5 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider w-full py-3 rounded-xl transition shadow-lg active:scale-98"
          >
            <Mic className="h-4.5 w-4.5" /> Record On-site Audio
          </button>
        )}
      </div>
    </div>
  );
}
