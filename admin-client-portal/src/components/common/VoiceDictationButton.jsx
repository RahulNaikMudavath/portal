import { useState } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { useSpeechToText } from "../../hooks/useSpeechToText";

/**
 * VoiceDictationButton
 * Floating or inline microphone button for hands-free speech-to-text dictation.
 *
 * @param {Function} onTranscriptChange - Callback returning transcribed string
 * @param {string} [currentValue] - Existing input value to append or replace
 * @param {boolean} [append=true] - Whether to append or overwrite target text
 * @param {string} [size="md"] - "sm" | "md" | "lg"
 * @param {string} [className] - Extra Tailwind CSS classes
 */
export default function VoiceDictationButton({
  onTranscriptChange,
  currentValue = "",
  append = true,
  size = "md",
  className = "",
  placeholder = "Click to speak...",
}) {
  const [initialBaseText, setInitialBaseText] = useState("");

  const {
    isListening,
    isSupported,
    toggleListening,
    error,
  } = useSpeechToText({
    continuous: true,
    lang: "en-IN",
    onResult: (transcriptText) => {
      if (!onTranscriptChange) return;

      if (append && initialBaseText) {
        onTranscriptChange(`${initialBaseText} ${transcriptText}`.trim());
      } else {
        onTranscriptChange(transcriptText.trim());
      }
    },
  });

  if (!isSupported) {
    return null; // Gracefully hidden if browser does not support Speech API
  }

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isListening) {
      setInitialBaseText(currentValue || "");
    }
    toggleListening();
  };

  const sizeClasses = {
    sm: "p-1.5 text-xs",
    md: "p-2 text-sm",
    lg: "p-3 text-base",
  };

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        title={isListening ? "Listening... Click to finish speaking" : placeholder}
        aria-label={isListening ? "Stop voice dictation" : "Start voice dictation"}
        className={`rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center relative ${sizeClasses[size] || sizeClasses.md} ${
          isListening
            ? "bg-rose-600 text-white shadow-lg shadow-rose-600/40 ring-2 ring-rose-400 ring-offset-2 ring-offset-slate-900 animate-pulse"
            : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 hover:border-slate-600"
        }`}
      >
        {isListening ? (
          <Mic className={`${iconSizes[size] || iconSizes.md} text-white animate-bounce`} />
        ) : (
          <Mic className={`${iconSizes[size] || iconSizes.md}`} />
        )}

        {/* Live Audio Waves Animation when active */}
        {isListening && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
        )}
      </button>

      {/* Floating Status Pill when listening */}
      {isListening && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-rose-600 text-white font-black text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full shadow-xl whitespace-nowrap flex items-center gap-1.5 z-30 pointer-events-none">
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping"></span>
          <span>Listening Site Notes...</span>
        </div>
      )}
    </div>
  );
}
