import { useState, useRef, useEffect } from "react";
import { Play, Pause, Mic } from "lucide-react";

export default function WhatsAppVoicePlayer({ audioUrl, isCustomer, time, senderName }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(18); // default fallback seconds
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const audioRef = useRef(null);

  // Synthesized realistic waveform bar heights for construction voice notes
  const waveformHeights = [
    30, 45, 75, 90, 60, 40, 80, 100, 65, 50,
    85, 95, 70, 40, 60, 90, 80, 55, 70, 85,
    60, 45, 70, 90, 50, 35, 65, 80, 40, 25
  ];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(Math.round(audio.duration));
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.playbackRate = playbackSpeed;
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn("Audio playback notice:", err);
        // Fallback simulation timer if audio URL is invalid/blob
        setIsPlaying(true);
        simulatePlayback();
      });
    }
  };

  const simulatePlayback = () => {
    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= duration) {
          clearInterval(interval);
          setIsPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 1000 / playbackSpeed);
  };

  const handleSpeedChange = () => {
    const speeds = [1, 1.5, 2];
    const nextIndex = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIndex];
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const handleScrub = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = percent * duration;
    setCurrentTime(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  const formatSeconds = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex flex-col gap-2 min-w-[240px] sm:min-w-[280px] p-2 select-none">
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}

      <div className="flex items-center gap-3">
        {/* Play / Pause circular button */}
        <button
          onClick={togglePlay}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md transition-all active:scale-95 cursor-pointer shrink-0 ${
            isCustomer
              ? "bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400"
              : "bg-emerald-700 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          }`}
          title={isPlaying ? "Pause voice note" : "Play voice note"}
        >
          {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
        </button>

        {/* Waveform Visualizer & Scrubber */}
        <div className="flex-1 flex flex-col justify-center gap-1.5 cursor-pointer" onClick={handleScrub}>
          <div className="h-7 flex items-center gap-[2.5px]">
            {waveformHeights.map((h, idx) => {
              const barPercent = (idx / waveformHeights.length) * 100;
              const isPast = barPercent <= progressPercent;

              return (
                <div
                  key={idx}
                  style={{ height: `${h}%` }}
                  className={`w-[3px] rounded-full transition-colors duration-150 ${
                    isPast
                      ? "bg-emerald-600 dark:bg-emerald-400"
                      : "bg-slate-300 dark:bg-slate-600/70"
                  }`}
                />
              );
            })}
          </div>

          {/* Time and Speed Control Bar */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span>{formatSeconds(isPlaying ? currentTime : duration)}</span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSpeedChange();
              }}
              className="px-1.5 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-700/80 hover:bg-slate-300 dark:hover:bg-slate-600 text-[10px] font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer"
              title="Change audio playback speed"
            >
              {playbackSpeed}x
            </button>
          </div>
        </div>

        {/* Mic Indicator Icon */}
        <div className="relative shrink-0 pr-1">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Mic className="h-4 w-4" />
          </div>
          <span className="absolute -bottom-1 -right-0.5 text-[10px]">🎙️</span>
        </div>
      </div>
    </div>
  );
}
