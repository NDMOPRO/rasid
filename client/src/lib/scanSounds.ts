/**
 * Scan Sound Effects - Web Audio API synthesized sounds
 * No external audio files needed - all sounds are generated programmatically
 */

let audioCtx: AudioContext | null = null;
let isMuted = false;

function getAudioContext(): AudioContext {
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setMuted(muted: boolean) {
  isMuted = muted;
}

export function getMuted(): boolean {
  return isMuted;
}

// ===== HELPER: Play a tone =====
function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.15,
  delay: number = 0,
) {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime + delay);
    gain.gain.setValueAtTime(0, ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  } catch {
    // Silently fail if audio context is not available
  }
}

// ===== HELPER: Play noise burst =====
function playNoise(duration: number, volume: number = 0.05, delay: number = 0) {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2000, ctx.currentTime);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(ctx.currentTime + delay);
  } catch {}
}

// ===== 1. SCAN START - Engine startup whoosh =====
export function playScanStart() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    // Rising sweep
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.4);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.6);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.7);
    // Accompanying noise whoosh
    playNoise(0.3, 0.04, 0.05);
    // Confirmation beep
    playTone(880, 0.15, 'sine', 0.08, 0.5);
    playTone(1100, 0.2, 'sine', 0.1, 0.6);
  } catch {}
}

// ===== 2. STAGE COMPLETE - Success chime =====
export function playStageComplete() {
  if (isMuted) return;
  // Two-note ascending chime
  playTone(523, 0.15, 'sine', 0.12, 0);     // C5
  playTone(659, 0.15, 'sine', 0.12, 0.1);   // E5
  playTone(784, 0.25, 'sine', 0.1, 0.2);    // G5
}

// ===== 3. PRIVACY PAGE DISCOVERED - Discovery alert =====
export function playDiscoveryAlert() {
  if (isMuted) return;
  // Magical discovery sound
  playTone(660, 0.12, 'sine', 0.1, 0);
  playTone(880, 0.12, 'sine', 0.1, 0.08);
  playTone(1100, 0.12, 'sine', 0.12, 0.16);
  playTone(1320, 0.3, 'sine', 0.1, 0.24);
  // Sparkle noise
  playNoise(0.15, 0.03, 0.2);
}

// ===== 4. ERROR/FAILURE - Warning sound =====
export function playErrorSound() {
  if (isMuted) return;
  // Low descending tone
  playTone(440, 0.2, 'sawtooth', 0.06, 0);
  playTone(330, 0.3, 'sawtooth', 0.06, 0.15);
}

// ===== 5. SCAN COMPLETE - Victory fanfare =====
export function playScanComplete() {
  if (isMuted) return;
  // Triumphant fanfare
  playTone(523, 0.15, 'sine', 0.12, 0);      // C5
  playTone(659, 0.15, 'sine', 0.12, 0.12);   // E5
  playTone(784, 0.15, 'sine', 0.12, 0.24);   // G5
  playTone(1047, 0.4, 'sine', 0.15, 0.36);   // C6
  // Harmony
  playTone(523, 0.5, 'triangle', 0.06, 0.36); // C5 harmony
  playTone(784, 0.5, 'triangle', 0.06, 0.36); // G5 harmony
  // Sparkle
  playNoise(0.2, 0.03, 0.5);
  playTone(1568, 0.1, 'sine', 0.04, 0.6);
  playTone(2093, 0.15, 'sine', 0.03, 0.7);
}

// ===== 6. CLAUSE PASS - Quick positive beep =====
export function playClausePass() {
  if (isMuted) return;
  playTone(880, 0.08, 'sine', 0.08, 0);
  playTone(1100, 0.12, 'sine', 0.08, 0.06);
}

// ===== 7. CLAUSE FAIL - Quick negative beep =====
export function playClauseFail() {
  if (isMuted) return;
  playTone(440, 0.12, 'triangle', 0.06, 0);
  playTone(350, 0.15, 'triangle', 0.06, 0.08);
}

// ===== 8. SITE COMPLETE - Subtle tick =====
export function playSiteComplete() {
  if (isMuted) return;
  playTone(1200, 0.05, 'sine', 0.05, 0);
}

// ===== 9. SCREENSHOT CAPTURED - Camera shutter =====
export function playScreenshotCapture() {
  if (isMuted) return;
  playNoise(0.08, 0.08, 0);
  playTone(2000, 0.04, 'sine', 0.06, 0.03);
}

// ===== 10. PROGRESS MILESTONE (25%, 50%, 75%) =====
export function playMilestone() {
  if (isMuted) return;
  playTone(660, 0.1, 'sine', 0.1, 0);
  playTone(880, 0.1, 'sine', 0.1, 0.08);
  playTone(660, 0.15, 'sine', 0.08, 0.16);
}

// ===== 11. CONSOLE LOG TICK - Very subtle =====
export function playLogTick() {
  if (isMuted) return;
  playTone(800, 0.02, 'sine', 0.02, 0);
}
