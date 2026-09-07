/**
 * Enterprise Audio Synthesizer for ConstructAI / ProjectFlow
 * Uses browser-native Web Audio API (zero external assets, 100% offline, zero latency)
 */

let audioCtx = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

const STORAGE_KEY = "constructai_audio_muted";

export function isAudioMuted() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

export function setAudioMuted(muted) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, muted ? "true" : "false");
  window.dispatchEvent(
    new CustomEvent("constructai_audio_mute_change", { detail: { muted } })
  );
}

export function toggleAudioMute() {
  const current = isAudioMuted();
  const next = !current;
  setAudioMuted(next);
  if (!next) {
    // Play a gentle preview tone when unmuting
    playTone(659.25, 0.15, "sine", 0.12);
  }
  return next;
}

/**
 * Low-level tone generator helper
 */
function playTone(freq, duration = 0.2, type = "sine", volume = 0.15, startTimeOffset = 0) {
  if (isAudioMuted()) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const startTime = ctx.currentTime + startTimeOffset;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  } catch (err) {
    console.warn("ConstructAI Audio Engine notice:", err);
  }
}

/**
 * 🚗 Site Check-in & GPS Dispatch Chime
 * Pleasant ascending harp arpeggio (C5 -> E5 -> G5 -> C6)
 */
export function playCheckInSound() {
  if (isAudioMuted()) return;
  const notes = [523.25, 659.25, 783.99, 1046.50];
  notes.forEach((freq, idx) => {
    playTone(freq, 0.25, "sine", 0.16, idx * 0.08);
  });
}

/**
 * 💬 WhatsApp / Chat Notification Pop
 * Soft modern two-tone bubble chime (F5 -> A5)
 */
export function playMessageSound() {
  if (isAudioMuted()) return;
  playTone(698.46, 0.12, "sine", 0.14, 0);
  playTone(880.00, 0.22, "sine", 0.18, 0.07);
}

/**
 * 🎉 Task Approval & Success Flourish
 * Harmonic celebratory chime
 */
export function playSuccessSound() {
  if (isAudioMuted()) return;
  const chord = [523.25, 659.25, 783.99]; // C Major
  chord.forEach((freq) => {
    playTone(freq, 0.35, "sine", 0.12, 0);
  });
  playTone(1046.50, 0.5, "sine", 0.2, 0.15); // High C
}

/**
 * ⚠️ Alert & Attention Ping
 * Dual tone warning pulse
 */
export function playAlertSound() {
  if (isAudioMuted()) return;
  playTone(440.0, 0.15, "triangle", 0.18, 0);
  playTone(349.23, 0.3, "triangle", 0.16, 0.12);
}
