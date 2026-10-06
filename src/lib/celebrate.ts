const GOLD = ["FFE400", "FFBD00", "E89400", "FFCA6C", "FDFFB8"];

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function chime(frequencies: number[], duration = 0.5) {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.06);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + i * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + duration);
    });
    setTimeout(() => ctx.close(), (duration + 0.5) * 1000);
  } catch {
    /* audio is a nice-to-have */
  }
}

/** Star burst from the clicked element, plus a short chime. Confetti is lazy-loaded. */
export async function celebrateLesson(origin?: HTMLElement | null) {
  chime([800, 1000, 1200]);
  if (reducedMotion()) return;
  const { default: confetti } = await import("canvas-confetti");
  const rect = origin?.getBoundingClientRect();
  const x = rect ? (rect.left + rect.width / 2) / window.innerWidth : 0.5;
  const y = rect ? (rect.top + rect.height / 2) / window.innerHeight : 0.5;
  const defaults = {
    origin: { x, y },
    spread: 360,
    ticks: 80,
    gravity: 0,
    decay: 0.92,
    startVelocity: 18,
    colors: GOLD,
    disableForReducedMotion: true,
  };
  const shoot = () => {
    confetti({ ...defaults, particleCount: 24, scalar: 1.1, shapes: ["star"] });
    confetti({ ...defaults, particleCount: 8, scalar: 0.7, shapes: ["circle"] });
  };
  shoot();
  setTimeout(shoot, 120);
}

/** Bigger celebration when a whole course is finished. */
export async function celebrateCourse() {
  chime([660, 880, 990, 1320], 0.7);
  if (reducedMotion()) return;
  const { default: confetti } = await import("canvas-confetti");
  const end = Date.now() + 1200;
  const frame = () => {
    confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0 }, colors: GOLD });
    confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1 }, colors: GOLD });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}
