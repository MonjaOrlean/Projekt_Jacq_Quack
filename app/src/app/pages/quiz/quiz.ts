import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';

interface Question {
  id?: string;
  topic?: string;
  text: string;
  answers: string[];
  correct: number;
}

@Component({
  selector: 'app-quiz',
  standalone: true,
  templateUrl: './quiz.html',
  styleUrls: ['./quiz.css'],
  imports: [NgIf, NgFor],
})
export class QuizComponent implements OnInit {
  constructor(private router: Router) {}

  /* ---------------- Sichtbarkeit / Status ---------------- */
  introVisible = true;          // Intro-Glaskarte zuerst!
  finished = false;             // Quiz zu Ende?
  showAbort = false;            // Abbrechen-Dialog im Spiel

  /* ---------------- Jacq (Mundbewegung) ------------------ */
  frames = [
    '/img/avatar/jacq_closed.png',
    '/img/avatar/jacq_half.png',
    '/img/avatar/jacq_open.png',
    '/img/avatar/jacq_half.png',
  ];
  frameIndex = 0;
  private mouthTimer?: number;

  private startMouth() {
    this.stopMouth();
    this.mouthTimer = window.setInterval(() => {
      this.frameIndex = (this.frameIndex + 1) % this.frames.length;
    }, 140);
  }
  private stopMouth() {
    if (this.mouthTimer) { clearInterval(this.mouthTimer); this.mouthTimer = undefined; }
    this.frameIndex = 0;
  }

  /* ---------------- Intro-Audio -------------------------- */
  private introUrl = '/audio/quiz_intro.mp3';
  private introAudio = new Audio(this.introUrl);

  private tryPlayIntro() {
    try {
      this.introAudio.currentTime = 0;
      this.introAudio.onplay = () => this.startMouth();
      this.introAudio.onended = () => this.stopMouth();
      this.introAudio.play().catch(() => {
        // Autoplay blockiert → User kann "Nochmal vorlesen" drücken
      });
    } catch {}
  }
  repeatIntro() { this.tryPlayIntro(); }

  /* ---------------- Fragen / Auswahl --------------------- */
  questions: Question[] = [];
  current?: Question;           // WICHTIG: undefined lassen bis Start!
  index = 0;
  total = 0;

  answered = false;             // wurde eine Antwort geklickt?
  isCorrect = false;
  correctText = '';
  correctCount = 0;

  quackDone = false;            // Quack fertig?

  /* ---------------- Quack-Sounds (WebAudio) -------------- */
  private readonly HAPPY_URL = '/audio/ente_happy.mp3';
  private readonly ANGRY_URL = '/audio/ente_angry.mp3';
  private ctx?: AudioContext;
  private buffers = new Map<string, AudioBuffer>();

  private async ensureCtx(): Promise<AudioContext> {
    if (!this.ctx) this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (this.ctx.state !== 'running') {
      try { await this.ctx.resume(); } catch {}
    }
    return this.ctx;
  }
  private async loadBuffer(url: string): Promise<AudioBuffer> {
    const hit = this.buffers.get(url);
    if (hit) return hit;
    const ctx = await this.ensureCtx();
    const resp = await fetch(url, { cache: 'no-cache' });
    const arr = await resp.arrayBuffer();
    const buf = await ctx.decodeAudioData(arr);
    this.buffers.set(url, buf);
    return buf;
  }
  private async playBuffer(url: string, timeoutMs = 2000): Promise<void> {
    const ctx = await this.ensureCtx();
    const buf = await this.loadBuffer(url);
    return new Promise<void>((resolve) => {
      let settled = false;
      const done = () => { if (!settled) { settled = true; resolve(); } };
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      const onEnded = () => { src.removeEventListener('ended', onEnded as any); done(); };
      src.addEventListener('ended', onEnded as any);
      const fallback = setTimeout(() => { try { src.stop(); } catch {} done(); }, timeoutMs);
      try { src.start(0); } catch { clearTimeout(fallback); done(); return; }
    });
  }

  /* ---------------- Lifecycle ---------------------------- */
  async ngOnInit() {
    // **Reset** – damit nie direkt ins Quiz gesprungen wird
    this.introVisible = true;
    this.finished = false;
    this.showAbort = false;

    this.current = undefined;   // <- ganz wichtig
    this.index = 0;
    this.total = 0;
    this.answered = false;
    this.quackDone = false;
    this.correctCount = 0;

    // Fragen laden (ohne sofort current zu setzen)
    try {
      const res = await fetch('/questions.json', { cache: 'no-cache' });
      const data: Question[] = await res.json();
      this.questions = Array.isArray(data) ? data : [];
      this.total = this.questions.length;
    } catch {
      this.questions = [];
      this.total = 0;
    }

    // Intro vorbereiten & automatisch versuchen
    this.introAudio.preload = 'auto';
    try { this.introAudio.load(); } catch {}
    this.tryPlayIntro();
  }

  /* ---------------- Intro-Aktionen ----------------------- */
  startQuiz() {
    if (this.total === 0) return;

    // Intro schließen & stoppen
    this.introVisible = false;
    try { this.introAudio.pause(); } catch {}
    this.stopMouth();

    // ersten Task vorbereiten
    this.index = 0;
    this.correctCount = 0;
    this.answered = false;
    this.quackDone = false;

    this.current = this.questions[this.index]; // **erst jetzt** setzen
  }

  cancelFromIntro() {
    try { this.introAudio.pause(); } catch {}
    this.stopMouth();
    this.router.navigateByUrl('/start');
  }

  /* ---------------- Auswahl / Weiter --------------------- */
  async select(i: number) {
    if (!this.current || this.answered) return;

    this.answered = true;
    this.quackDone = false;

    this.isCorrect = i === this.current.correct;
    this.correctText = this.current.answers[this.current.correct];

    try {
      await this.playBuffer(this.isCorrect ? this.HAPPY_URL : this.ANGRY_URL);
    } finally {
      this.quackDone = true;
      if (this.isCorrect) this.correctCount++;
    }
  }

  nextQuestion() {
    if (!this.answered || !this.quackDone) return;

    this.answered = false;
    this.quackDone = false;
    this.index++;

    if (this.index >= this.total) {
      this.finished = true;
      return;
    }
    this.current = this.questions[this.index];
  }

  /* ---------------- Ergebnis / Navigation ---------------- */
  goResult() {
    const payload = { correct: this.correctCount, total: this.total };
    try { sessionStorage.setItem('jq_result', JSON.stringify(payload)); } catch {}
    this.router.navigateByUrl('/result', { state: payload });
  }

  /* ---------------- Abbrechen im Spiel ------------------- */
  openAbort() { this.showAbort = true; }
  cancelAbort(feige: boolean) {
    this.showAbort = false;
    if (feige) {
      this.playBuffer(this.ANGRY_URL).finally(() => this.router.navigateByUrl('/start'));
    } else {
      this.playBuffer(this.HAPPY_URL).finally(() => {});
    }
  }
}
