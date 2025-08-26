import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { Router } from '@angular/router';

type RawQ = { id:string; text:string; answers:string[]; correct:number; topic?:string };
type ViewAns = { text:string; correct:boolean };
type ViewQ = { text:string; answers:ViewAns[] };

@Component({
  selector: 'app-quiz',
  standalone: true,
  templateUrl: './quiz.html',
  styleUrl: './quiz.css',
  imports: [NgFor, NgIf, NgClass],
})
export class Quiz implements OnInit {
  constructor(private router: Router) {}

  loading = true;
  error = '';

  all: RawQ[] = [];
  queue: RawQ[] = [];      // max 10 Fragen
  index = 0;               // 0..queue.length-1
  score = 0;

  q: ViewQ | null = null;  // aktuelle View-Frage
  answered = false;
  selectedIndex: number | null = null;
  isCorrect: boolean | null = null;

  // === Sounds ===
  private sOk?: HTMLAudioElement;   // /audio/ente_happy.mp3
  private sNo?: HTMLAudioElement;   // /audio/ente_angry.mp3

  async ngOnInit() {
    // Sounds vorbereiten (werden beim ersten Klick sicher gespielt)
    try {
      this.sOk = new Audio('/audio/ente_happy.mp3');
      this.sOk.volume = 0.7;
      this.sOk.preload = 'auto';
      this.sNo = new Audio('/audio/ente_angry.mp3');
      this.sNo.volume = 0.7;
      this.sNo.preload = 'auto';
    } catch {}

    await this.loadAll();
    this.startRound();
    this.showCurrent();
  }

  private async loadAll() {
    try {
      this.loading = true;
      this.error = '';
      const res = await fetch('/questions.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.json();
      if (!Array.isArray(raw) || raw.length === 0) throw new Error('Leere Fragenliste');
      this.all = raw as RawQ[];
    } catch (e:any) {
      this.error = 'Konnte Fragen nicht laden. ' + (e?.message ?? e);
    } finally {
      this.loading = false;
    }
  }

  private startRound() {
    const arr = [...this.all];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    const N = Math.min(10, arr.length);
    this.queue = arr.slice(0, N);
    this.index = 0;
    this.score = 0;
  }

  private showCurrent() {
    const item = this.queue[this.index];
    if (!item) { this.finish(); return; }

    const answers: ViewAns[] = item.answers.map((t, i) => ({
      text: String(t),
      correct: i === item.correct
    }));

    // Antworten mischen (optional)
    for (let i = answers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [answers[i], answers[j]] = [answers[j], answers[i]];
    }

    this.q = { text: String(item.text), answers };
    this.answered = false;
    this.selectedIndex = null;
    this.isCorrect = null;
  }

  select(i: number) {
    if (this.answered || !this.q) return;
    this.selectedIndex = i;
    this.answered = true;
    const ok = this.q.answers[i].correct;
    this.isCorrect = ok;
    if (ok) this.score++;

    // Sound abspielen (User-Klick -> erlaubt)
    this.play(ok ? this.sOk : this.sNo);
  }

  next() {
    if (!this.answered) return;
    this.index++;
    if (this.index >= this.queue.length) {
      this.finish();
    } else {
      this.showCurrent();
    }
  }

  private finish() {
    sessionStorage.setItem('quiz_score', String(this.score));
    sessionStorage.setItem('quiz_total', String(this.queue.length));
    this.router.navigateByUrl('/result');
  }

  private play(a?: HTMLAudioElement) {
    try {
      if (!a) return;
      a.currentTime = 0;
      a.play().catch(() => {});
    } catch {}
  }

  get progressLabel() {
    return `${Math.min(this.index+1, this.queue.length)} / ${this.queue.length}`;
  }
}
