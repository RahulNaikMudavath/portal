export default function WhatsAppWallpaper() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none transition-opacity duration-300"
      style={{
        backgroundColor: "var(--whatsapp-bg, transparent)",
      }}
    >
      {/* WhatsApp SVG Doodle Pattern */}
      <svg
        className="w-full h-full opacity-[0.05] dark:opacity-[0.035] text-slate-900 dark:text-white"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id="whatsapp-doodle-pattern"
            width="280"
            height="280"
            patternUnits="userSpaceOnUse"
          >
            {/* Chat Bubble & Smileys */}
            <path
              fill="currentColor"
              d="M30 40c0-8.8 7.2-16 16-16h24c8.8 0 16 7.2 16 16v12c0 8.8-7.2 16-16 16H52l-14 10v-10c-4.4 0-8-3.6-8-8V40z"
              opacity="0.7"
            />
            <circle cx="50" cy="48" r="2.5" fill="currentColor" />
            <circle cx="62" cy="48" r="2.5" fill="currentColor" />
            <circle cx="74" cy="48" r="2.5" fill="currentColor" />

            {/* Construction Gear / Tool */}
            <path
              fill="currentColor"
              d="M170 35l4-2 3 3-2 4a15 15 0 0 1 3 5l5-1 2 4-4 3a15 15 0 0 1 0 6l4 3-2 4-5-1a15 15 0 0 1-3 5l2 4-3 3-4-2a15 15 0 0 1-5 3l-1 5-4 2-3-4a15 15 0 0 1-6 0l-3 4-4-2-1-5a15 15 0 0 1-5-3l-4 2-3-3 2-4a15 15 0 0 1-3-5l-5 1-2-4 4-3a15 15 0 0 1 0-6l-4-3 2-4 5 1a15 15 0 0 1 3-5l-2-4 3-3 4 2a15 15 0 0 1 5-3l1-5 4-2 3 4a15 15 0 0 1 6 0l3-4 4 2 1 5a15 15 0 0 1 5 3zm-7 15a8 8 0 1 0 0 16 8 8 0 0 0 0-16z"
              opacity="0.8"
            />

            {/* Coffee Cup / Mug */}
            <path
              fill="currentColor"
              d="M230 45h20a10 10 0 0 1 10 10v8a10 10 0 0 1-10 10h-2v4a12 12 0 0 1-12 12h-16a12 12 0 0 1-12-12v-32h22zm18 18h2a4 4 0 0 0 4-4v-8a4 4 0 0 0-4-4h-2v16z"
              opacity="0.6"
            />

            {/* Checkmark Double Ticks */}
            <path
              fill="currentColor"
              d="M35 155l6 6 14-14 3 3-17 17-9-9 3-3zm10 0l6 6 14-14 3 3-17 17-9-9 3-3z"
              opacity="0.9"
            />

            {/* Phone / Receiver */}
            <path
              fill="currentColor"
              d="M110 130c12 0 22 10 22 22v6c0 4-3 8-8 8h-4c-2 0-4-1-5-3l-3-6c-1-2-1-4 0-5l2-3c-1-4-5-8-9-9l-3 2c-1 1-3 1-5 0l-6-3c-2-1-3-3-3-5v-4c0-5 4-8 8-8z"
              opacity="0.7"
            />

            {/* Clock / Timer */}
            <circle cx="210" cy="140" r="14" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.7" />
            <path d="M210 132v8h6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />

            {/* Blueprint ruler / Pencil */}
            <path
              fill="currentColor"
              d="M40 240l45-45 8 8-45 45-12 4 4-12zm38-42l-4-4 6-6 4 4-6 6z"
              opacity="0.75"
            />

            {/* Location GPS Pin */}
            <path
              fill="currentColor"
              d="M140 215c-9 0-16 7-16 16 0 12 16 26 16 26s16-14 16-26c0-9-7-16-16-16zm0 21a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"
              opacity="0.8"
            />

            {/* Document / Blueprint paper */}
            <path
              fill="currentColor"
              d="M220 220h22l10 10v26a4 4 0 0 1-4 4h-28a4 4 0 0 1-4-4v-32a4 4 0 0 1 4-4zm20 8v-6l6 6h-6z"
              opacity="0.7"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#whatsapp-doodle-pattern)" />
      </svg>
    </div>
  );
}
