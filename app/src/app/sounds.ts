// src/app/shared_header/header/sound.ts
export class Sound {
  private ctx?: AudioContext;
  private getCtx(): AudioContext {
    if (!this.ctx) this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  quackAngry() {
    const ctx = this.getCtx();
    const t0 = ctx.currentTime + 0.01;

    // Rauschen
    const noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.5), ctx.sampleRate);
    const ch = noiseBuf.getChannelData(0);
    for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * 0.6;
    const noise = ctx.createBufferSource(); noise.buffer = noiseBuf;

    // Filter
    const band = ctx.createBiquadFilter(); band.type = 'bandpass'; band.frequency.value = 550; band.Q.value = 4;
    const low  = ctx.createBiquadFilter(); low.type  = 'lowpass';  low.frequency.value = 1800; low.Q.value = 0.7;

    // Abwärts-Sweep
    const osc = ctx.createOscillator(); osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(420, t0);
    osc.frequency.exponentialRampToValueAtTime(220, t0 + 0.28);

    const gOsc = ctx.createGain(); gOsc.gain.value = 0;
    const gMix = ctx.createGain(); gMix.gain.value = 0;

    // sanfte Verzerrung
    const shaper = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) { const x = i / 255 * 2 - 1; curve[i] = Math.tanh(2.4 * x); }
    shaper.curve = curve; shaper.oversample = '4x';

    const out = ctx.createGain(); out.gain.value = 0.8;

    noise.connect(band).connect(low).connect(gMix);
    osc.connect(gOsc);
    gOsc.connect(gMix);
    gMix.connect(shaper).connect(out).connect(ctx.destination);

    // Hüllkurven
    const A = 0.01, D = 0.12, R = 0.10, L = 0.35;
    const env = (g: GainNode) => {
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(1.0, t0 + A);
      g.gain.linearRampToValueAtTime(L,   t0 + A + D);
      g.gain.setValueAtTime(L, t0 + A + D);
      g.gain.linearRampToValueAtTime(0,   t0 + A + D + R);
    };
    env(gOsc);
    env(gMix);

    noise.start(t0); noise.stop(t0 + A + D + R + 0.02);
    osc.start(t0);   osc.stop(t0 + A + D + R + 0.03);
  }

  quackBright() {
    const ctx = this.getCtx();
    const t0 = ctx.currentTime + 0.01;

    const osc = ctx.createOscillator(); osc.type = 'square';
    osc.frequency.setValueAtTime(750, t0);
    osc.frequency.exponentialRampToValueAtTime(430, t0 + 0.18);

    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 800; bp.Q.value = 5;

    const g = ctx.createGain(); g.gain.value = 0;
    osc.connect(g).connect(bp).connect(ctx.destination);

    const A = 0.008, D = 0.10, R = 0.06, L = 0.25;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(1, t0 + A);
    g.gain.linearRampToValueAtTime(L, t0 + A + D);
    g.gain.linearRampToValueAtTime(0, t0 + A + D + R);

    osc.start(t0); osc.stop(t0 + A + D + R + 0.02);
  }
}
