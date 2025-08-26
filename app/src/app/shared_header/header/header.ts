import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';

/** Web-Audio-Fallback (nur falls die Datei mal nicht lädt) */
class Sound {
  private ctx?: AudioContext;
  private getCtx(): AudioContext {
    if (!this.ctx) this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    return this.ctx;
  }
  quackBright() {
    const ctx = this.getCtx(), t0 = ctx.currentTime + 0.01;
    const osc = ctx.createOscillator(); osc.type = 'square';
    osc.frequency.setValueAtTime(750, t0);
    osc.frequency.exponentialRampToValueAtTime(430, t0 + 0.18);
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 800; bp.Q.value = 5;
    const g = ctx.createGain(); g.gain.value = 0;
    osc.connect(g).connect(bp).connect(ctx.destination);
    const A=.008,D=.10,R=.06,L=.25;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(1, t0 + A);
    g.gain.linearRampToValueAtTime(L, t0 + A + D);
    g.gain.linearRampToValueAtTime(0, t0 + A + D + R);
    osc.start(t0); osc.stop(t0 + A + D + R + .02);
  }
  quackAngry() {
    const ctx = this.getCtx(), t0 = ctx.currentTime + 0.01;
    const noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.5), ctx.sampleRate);
    const ch = noiseBuf.getChannelData(0);
    for (let i = 0; i < ch.length; i++) ch[i] = (Math.random()*2-1)*0.6;
    const noise = ctx.createBufferSource(); noise.buffer = noiseBuf;
    const band = ctx.createBiquadFilter(); band.type='bandpass'; band.frequency.value=550; band.Q.value=4;
    const low  = ctx.createBiquadFilter(); low.type='lowpass';  low.frequency.value=1800; low.Q.value=.7;
    const osc = ctx.createOscillator(); osc.type='sawtooth';
    osc.frequency.setValueAtTime(420, t0);
    osc.frequency.exponentialRampToValueAtTime(220, t0 + .28);
    const gOsc = ctx.createGain(); const gMix = ctx.createGain();
    gOsc.gain.value = 0; gMix.gain.value = 0;
    const shaper = ctx.createWaveShaper(); const curve = new Float32Array(256);
    for (let i=0;i<256;i++){const x=i/255*2-1;curve[i]=Math.tanh(2.4*x)} shaper.curve=curve; shaper.oversample='4x';
    const out = ctx.createGain(); out.gain.value=.8;
    noise.connect(band).connect(low).connect(gMix);
    osc.connect(gOsc); gOsc.connect(gMix); gMix.connect(shaper).connect(out).connect(ctx.destination);
    const A=.01,D=.12,R=.10,L=.35;
    const env=(g:GainNode)=>{g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(1,t0+A);g.gain.linearRampToValueAtTime(L,t0+A+D);g.gain.linearRampToValueAtTime(0,t0+A+D+R);};
    env(gOsc); env(gMix);
    noise.start(t0); noise.stop(t0+A+D+R+.02);
    osc.start(t0);   osc.stop(t0+A+D+R+.03);
  }
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgIf],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit, OnDestroy {
  time = signal(this.nowHHMM());
  private t?: number;

  // Abbrechen-Dialog
  showAbort = false;

  // 🦆 Easter-Egg Tipp
  showDuckTip = false;
  duckTipText = '';

  // Deine Audios
  private angryFile?: HTMLAudioElement;   // /audio/ente_angry.mp3
  private happyFile?: HTMLAudioElement;   // /audio/ente_happy.mp3
  private neutralFile?: HTMLAudioElement; // /audio/ente_neutral.mp3

  // Fallback
  private sound = new Sound();

  // kleine Tipp-Sammlung
  private tips = [
    'Erkläre deinem 🦆-Gummientchen dein Problem – oft merkst du beim Reden die Lösung.',
    'Kleine Schritte: Reproduziere den Fehler mit minimalem Code.',
    'Log-Ausgaben helfen: Prüfe Werte direkt vor der Stelle, die spinnt.',
    'Teil das Problem auf: Eingabe, Verarbeitung, Ausgabe – wo hakt es?',
    'Ändert sich nur EINES? Dann teste genau diese Kleinigkeit zuerst.',
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.t = window.setInterval(() => this.time.set(this.nowHHMM()), 1000);
    try {
      this.angryFile   = new Audio('/audio/ente_angry.mp3');
      this.happyFile   = new Audio('/audio/ente_happy.mp3');
      this.neutralFile = new Audio('/audio/ente_neutral.mp3');
      for (const a of [this.angryFile, this.happyFile, this.neutralFile]) {
        if (a) { a.preload = 'auto'; a.volume = 0.7; }
      }
    } catch {}
  }
  ngOnDestroy(): void { if (this.t) clearInterval(this.t); }

  private nowHHMM(): string {
    const d = new Date(); const hh = String(d.getHours()).padStart(2,'0'); const mm = String(d.getMinutes()).padStart(2,'0'); return `${hh}:${mm}`;
  }

  // 🦆 Easter-Egg
  onDuck() {
    this.duckTipText = this.tips[Math.floor(Math.random() * this.tips.length)];
    this.showDuckTip = true;
    const a = this.neutralFile;
    if (a) {
      try { a.currentTime = 0; a.play().catch(() => this.sound.quackBright()); }
      catch { this.sound.quackBright(); }
    } else {
      this.sound.quackBright();
    }
  }
  closeDuckTip() { this.showDuckTip = false; }

  // Abbrechen
  onAbort() {
    this.showAbort = true;
    const a = this.angryFile;
    if (a) {
      try { a.currentTime = 0; a.play().catch(() => this.sound.quackAngry()); }
      catch { this.sound.quackAngry(); }
    } else {
      this.sound.quackAngry();
    }
  }
  keepGoing() { this.showAbort = false; }
  confirmAbort() { this.showAbort = false; this.router.navigateByUrl('/start'); }

  // Logout → Abspann
  onLogout() { this.router.navigateByUrl('/credits'); }
}
