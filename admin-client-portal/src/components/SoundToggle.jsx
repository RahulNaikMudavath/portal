import { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { isAudioMuted, toggleAudioMute } from "../utils/soundEffects";

export function SoundToggle() {
  const [muted, setMuted] = useState(isAudioMuted());

  useEffect(() => {
    const handleMuteChange = (e) => {
      setMuted(e.detail?.muted ?? isAudioMuted());
    };

    window.addEventListener("constructai_audio_mute_change", handleMuteChange);
    return () => {
      window.removeEventListener("constructai_audio_mute_change", handleMuteChange);
    };
  }, []);

  const handleToggle = () => {
    const newMuted = toggleAudioMute();
    setMuted(newMuted);
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer relative"
      title={muted ? "Sound Effects: Muted (Click to Unmute)" : "Sound Effects: Active (Click to Mute)"}
      aria-label={muted ? "Unmute sound effects" : "Mute sound effects"}
    >
      {muted ? (
        <VolumeX className="h-5 w-5 text-slate-400 dark:text-slate-500" />
      ) : (
        <Volume2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
      )}
      <span
        className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${
          muted ? "bg-slate-400/40" : "bg-emerald-500 ring-2 ring-emerald-500/20 animate-pulse"
        }`}
      />
    </button>
  );
}

export default SoundToggle;
