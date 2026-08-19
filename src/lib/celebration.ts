import confetti from 'canvas-confetti';

const GEN_Z_PRAISES = [
  { title: 'Gokil, satu task kelar!', description: 'Sat-set banget lo bos, gaskeun terus!' },
  { title: 'Mantap jiwa!', description: 'Beban berkurang satu, kepala makin santuy.' },
  { title: 'Keren parah!', description: 'Satu langkah lebih deket ke beres semua target.' },
  { title: 'Auto lega!', description: 'Task ini resmi kelar lo beresin tanpa drama.' },
  { title: 'Gas terus ritmenya!', description: 'Lo lagi produktif banget hari ini, jangan kasih kendor.' },
  { title: 'Cakep banget!', description: 'Satu urusan bootcamp sukses dieksekusi dengan mantap.' },
  { title: 'Level up!', description: 'Lo emang jagoan eksekusi sat-set.' },
  { title: 'Sikat abis!', description: 'Task kelar, gas sikat task berikutnya sampe ludes!' }
];

export function getRandomCelebrationMessage() {
  const index = Math.floor(Math.random() * GEN_Z_PRAISES.length);
  return GEN_Z_PRAISES[index];
}

/**
 * Synthesizes a pleasant celebratory chime using Web Audio API
 */
export function playCelebrationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Harmonious ascending arpeggio notes (C5 -> E5 -> G5 -> C6)
    const notes = [523.25, 659.25, 783.99, 1046.50];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.15, now + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.45);
    });
  } catch {
    // Graceful fallback if audio is not allowed or blocked
  }
}

/**
 * Fires confetti effects and sound
 */
export function triggerCelebrationEffect() {
  // Sound
  playCelebrationSound();

  // Confetti burst
  try {
    // Center-bottom pop
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#0284c7', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#6366f1']
    });

    // Side canons
    setTimeout(() => {
      confetti({
        particleCount: 30,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.85 },
        colors: ['#10b981', '#06b6d4', '#f59e0b']
      });
      confetti({
        particleCount: 30,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.85 },
        colors: ['#8b5cf6', '#ec4899', '#3b82f6']
      });
    }, 120);
  } catch {
    // Fallback if canvas is not available
  }
}
