const ctx = (() => {
  try {
    return new AudioContext();
  } catch {
    return null;
  }
})();

function resume() {
  if (ctx && ctx.state === 'suspended') ctx.resume();
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  gain = 0.3,
  fadeOut = true,
) {
  if (!ctx) return;
  resume();
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  g.gain.setValueAtTime(gain, ctx.currentTime);
  if (fadeOut) g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

function noise(duration: number, gain = 0.15) {
  if (!ctx) return;
  resume();
  const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  const g = ctx.createGain();
  src.buffer = buffer;
  g.gain.setValueAtTime(gain, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  src.connect(g);
  g.connect(ctx.destination);
  src.start();
}

export const SFX = {
  rip() {
    noise(0.25, 0.2);
    tone(180, 0.15, 'sawtooth', 0.1);
  },
  flip() {
    tone(600, 0.08, 'sine', 0.15);
    setTimeout(() => tone(900, 0.08, 'sine', 0.1), 80);
  },
  snap() {
    noise(0.05, 0.3);
    tone(200, 0.05, 'square', 0.2, false);
  },
  woosh() {
    if (!ctx) return;
    resume();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.3);
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  },
  sparkle() {
    [800, 1000, 1200, 1500].forEach((f, i) =>
      setTimeout(() => tone(f, 0.15, 'sine', 0.12), i * 60),
    );
  },
  click() {
    tone(500, 0.06, 'square', 0.1, false);
  },
};
