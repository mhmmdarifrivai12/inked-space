// Simple chime + voice using Web APIs (no external assets)
let ctx: AudioContext | null = null;
const getCtx = () => {
  if (typeof window === "undefined") return null;
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return ctx;
};

export const playChime = async () => {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") await c.resume();
  const now = c.currentTime;
  const notes = [880, 1175, 1568]; // A5, D6, G6
  notes.forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const start = now + i * 0.18;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.35, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.55);
    osc.connect(gain).connect(c.destination);
    osc.start(start);
    osc.stop(start + 0.6);
  });
};

export const speakNumber = (n: number, name?: string) => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(
    `Nomor antrian ${n}${name ? `, atas nama ${name}` : ""}, silakan menuju ke ruang tato.`
  );
  u.lang = "id-ID";
  u.rate = 0.95;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
};

export const ringAlarm = async (n: number, name?: string) => {
  await playChime();
  setTimeout(() => playChime(), 700);
  setTimeout(() => speakNumber(n, name), 1500);
};
