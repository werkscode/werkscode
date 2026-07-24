/**
 * Lightweight Web Audio reactive layer for the Morph field lab.
 * Unlocks on first user gesture (browser autoplay policy).
 */
export function createAudioEngine() {
  let ctx = null;
  let masterGain = null;
  let filter = null;
  let oscillator = null;
  let lfo = null;
  let muted = false;
  let unlocked = false;
  let lastSwell = 0;

  function ensure() {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = muted ? 0 : 0.12;
    masterGain.connect(ctx.destination);

    filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 180;
    filter.Q.value = 4;
    filter.connect(masterGain);

    oscillator = ctx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = 55;
    const oscGain = ctx.createGain();
    oscGain.gain.value = 0.4;
    oscillator.connect(oscGain);
    oscGain.connect(filter);

    lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.08;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 8;
    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);

    oscillator.start();
    lfo.start();
    return true;
  }

  async function unlock() {
    if (!ensure()) return;
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (e) {
        // ignore
      }
    }
    unlocked = true;
  }

  function setMuted(value) {
    muted = value;
    if (masterGain) {
      masterGain.gain.value = muted ? 0 : 0.12;
    }
  }

  function isMuted() {
    return muted;
  }

  function update({ populationNorm, expanding, morph }) {
    if (!ctx || !unlocked || muted) return;
    const now = ctx.currentTime;
    const targetFreq = 120 + populationNorm * 520;
    filter.frequency.setTargetAtTime(targetFreq, now, 0.25);
    const basePitch = expanding ? 58 : 48;
    oscillator.frequency.setTargetAtTime(basePitch, now, 0.4);

    // Soft swell near morph peak
    if (morph > 0.92 && now - lastSwell > 2.5) {
      lastSwell = now;
      const swell = ctx.createGain();
      swell.gain.value = 0;
      swell.connect(masterGain);
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = 110;
      osc.connect(swell);
      osc.start(now);
      swell.gain.linearRampToValueAtTime(0.18, now + 0.15);
      swell.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc.stop(now + 1.3);
    }
  }

  function eraseBurst() {
    if (!ctx || !unlocked || muted) return;
    const now = ctx.currentTime;
    const bufferSize = 2 * ctx.sampleRate * 0.12;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const g = ctx.createGain();
    g.gain.value = 0.22;
    const bp = ctx.createBiquadFilter();
    bp.type = 'highpass';
    bp.frequency.value = 800;
    src.connect(bp);
    bp.connect(g);
    g.connect(masterGain);
    src.start(now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
  }

  function seedChirp() {
    if (!ctx || !unlocked || muted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
    g.gain.value = 0.1;
    osc.connect(g);
    g.connect(masterGain);
    osc.start(now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.stop(now + 0.22);
  }

  function dispose() {
    try {
      if (oscillator) oscillator.stop();
      if (lfo) lfo.stop();
      if (ctx) ctx.close();
    } catch (e) {
      // ignore
    }
    ctx = null;
    masterGain = null;
    filter = null;
    oscillator = null;
    lfo = null;
    unlocked = false;
  }

  return {
    unlock,
    setMuted,
    isMuted,
    update,
    eraseBurst,
    seedChirp,
    dispose,
  };
}
