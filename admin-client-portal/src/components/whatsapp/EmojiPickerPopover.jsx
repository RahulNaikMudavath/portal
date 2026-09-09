import { useState } from "react";
import { Smile, X } from "lucide-react";

export const EMOJI_LIST = [
  // Quick Reaction / Sentiment
  "👍", "❤️", "😊", "🙏", "👌", "🔥", "🎉", "🤝", "🙌", "✨",
  "😂", "😮", "👏", "💯", "💪", "😎", "🚀", "💡", "👋", "⭐",
  // Construction & Tools
  "🏗️", "📐", "👷", "🔨", "🛠️", "🧱", "🏢", "🏠", "🚚", "🚗",
  "📍", "💰", "📋", "⚡", "✅", "⏳", "⚠️", "🚨", "🔍", "📊",
  "📈", "📌", "📝", "🛡️", "📦", "🗂️", "📏", "🔐", "🗓️", "⚖️"
];

export default function EmojiPickerPopover({ isOpen, onClose, onSelectEmoji }) {
  if (!isOpen) return null;

  return (
    <div className="absolute bottom-16 left-4 z-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xl w-72 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Smile className="h-3.5 w-3.5 text-amber-500" />
          <span>Quick Emojis</span>
        </span>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-6 gap-1.5 max-h-48 overflow-y-auto pr-1">
        {EMOJI_LIST.map((emoji, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              onSelectEmoji(emoji);
            }}
            className="w-9 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-lg transition active:scale-90 cursor-pointer"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
