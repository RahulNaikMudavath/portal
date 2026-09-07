import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, Eye, Maximize2 } from "lucide-react";

/**
 * BeforeAfterSlider
 * Interactive split slider for comparing site inspection photos (Before vs After)
 * with touch, mouse, and keyboard drag support.
 *
 * @param {string} beforeImage - URL of before/initial state photo
 * @param {string} afterImage - URL of after/completed state photo
 * @param {string} [beforeLabel="Before Work"] - Label for left side
 * @param {string} [afterLabel="After Completion"] - Label for right side
 * @param {string} [aspectRatio="16/9"] - Aspect ratio container
 * @param {string} [className=""] - Extra CSS classes
 */
export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = "Before Work",
  afterLabel = "After Completion",
  aspectRatio = "16/9",
  className = "",
}) {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 to 100
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = useCallback(
    (clientX) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percent = Math.min(Math.max((x / rect.width) * 100, 0), 100);
      setSliderPosition(percent);
    },
    []
  );

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setSliderPosition((p) => Math.max(0, p - 5));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setSliderPosition((p) => Math.min(100, p + 5));
    }
  };

  if (!beforeImage && !afterImage) {
    return null;
  }

  // Fallback if only one image exists
  if (!beforeImage || !afterImage) {
    const singleImage = beforeImage || afterImage;
    const label = beforeImage ? beforeLabel : afterLabel;
    return (
      <div className={`relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 ${className}`}>
        <img
          src={singleImage}
          alt={label}
          className="w-full h-full object-cover max-h-80"
          loading="lazy"
        />
        <span className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border border-slate-700">
          {label}
        </span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onTouchMove={handleTouchMove}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="slider"
      aria-label="Before and after photo comparison slider"
      aria-valuenow={Math.round(sliderPosition)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 select-none cursor-ew-resize focus:outline-none focus:ring-2 focus:ring-indigo-500/80 ${className}`}
      style={{ aspectRatio }}
    >
      {/* 1. After Image (Background Layer) */}
      <img
        src={afterImage}
        alt={afterLabel}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        loading="lazy"
      />
      <span className="absolute top-3 right-3 z-10 bg-emerald-950/80 backdrop-blur-md text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border border-emerald-500/40 pointer-events-none shadow-md">
        {afterLabel}
      </span>

      {/* 2. Before Image (Clipped Foreground Layer) */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={beforeImage}
          alt={beforeLabel}
          className="absolute top-0 left-0 h-full object-cover pointer-events-none"
          style={{
            width: containerRef.current ? `${containerRef.current.clientWidth}px` : "100%",
            maxWidth: "none",
          }}
          loading="lazy"
        />
        <span className="absolute top-3 left-3 z-10 bg-amber-950/80 backdrop-blur-md text-amber-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border border-amber-500/40 pointer-events-none shadow-md">
          {beforeLabel}
        </span>
      </div>

      {/* 3. Slider Handle Divider Line */}
      <div
        onMouseDown={() => setIsDragging(true)}
        className="absolute top-0 bottom-0 w-1 bg-white/90 shadow-2xl pointer-events-auto cursor-ew-resize z-20 flex items-center justify-center -ml-0.5"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Glowing Center Knob */}
        <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-white shadow-xl flex items-center justify-center text-white text-xs hover:scale-110 active:scale-95 transition-transform cursor-ew-resize">
          <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-400" />
        </div>
      </div>

      {/* Subtle Bottom Instruction */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-950/70 backdrop-blur-md px-3 py-0.5 rounded-full text-[9px] font-medium text-slate-400 pointer-events-none">
        ↔ Drag slider to compare
      </div>
    </div>
  );
}
