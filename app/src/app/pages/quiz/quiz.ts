import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { AudioService } from '../../shared/services/audio.service';

interface RawQuestion {
  id: string;
  topic: string;
  text: string;
  answers: string[];
  correct: number;
}

interface Answer {
  text: string;
  correct: boolean;
}

interface Question {
  id: string;
  text: string;
  answers: Answer[];
}

@Component({
  selector: 'app-quiz',
  standalone: true,
  templateUrl: './quiz.html',
  styleUrls: ['./quiz.css'],
  imports: [NgIf, NgFor],
})
export class QuizComponent implements OnInit, OnDestroy {
  // Intro-Glaskarte
  askCoffee = true;

  // Abbrechen-Modal
  showAbort = false;

  // Avatar-Frames (Mundbewegung NUR während Intro)
  frames = ['/img/avatar/jacq_closed.png', '/img/avatar/jacq_half.png', '/img/avatar/jacq_open.png'];
  idx = 0;
  private talkTimer?: number;
  private talking = false;

  // Fragen/Daten
  private all: Question[] = [];
  private loaded = false;
  private qIndex = 0;

  current: { text: string } | null = null;
  answers: Answer[] = [];
  correctIdx = -1;

  selected: number | null = null;
  showFeedback = false;
  lastWasCorrect = false;
  msg = '';
  progressLabel = '';

  correctCount = 0;
  totalCount = 0;

  constructor(private router: Router, private audio: AudioService) {}

  // ====== Lebenszyklus ======
  async ngOnInit(): Promise<void> {
    // Intro automatisch vorlesen (wenn Autoplay erlaubt)
    if (this.askCoffee) {
      const handle = this.audio.playWithHandle('quizIntro');
      if (handle) {
        this.startTalking();
        const onEnd = () => {
          this.stopTalking();
          handle.removeEventListener('ended', onEnd);
        };
        handle.addEventListener('ended', onEnd);
      }
    }
  }

  ngOnDestroy(): void {
    this.audio.stopAll();
    this.stopTalking();
  }

  // ====== Intro / Jacq-Bewegung ======
  private startTalking() {
    if (this.talking) return;
    this.talking = true;
    // entschleunigte Mundanimation
    this.talkTimer = window.setInterval(() => {
      this.idx = (this.idx + 1) % this.frames.length;
    }, 320);
  }

  private stopTalking() {
    if (!this.talking) return;
    this.talking = false;
    if (this.talkTimer) {
      clearInterval(this.talkTimer);
      this.talkTimer = undefined;
    }
    this.idx = 0; // Mund zu
  }

  // ====== Intro-Buttons ======
  async startQuiz() {
    this.askCoffee = false;
    this.audio.stopAll();
    this.stopTalking();

    this.correctCount = 0;
    this.qIndex = 0;
    this.selected = null;
    this.showFeedback = false;

    await this.loadQuestion();
  }

  replayIntro() {
    const handle = this.audio.playWithHandle('quizIntro');
    if (handle) {
      this.startTalking();
      const onEnd = () => {
        this.stopTalking();
        handle.removeEventListener('ended', onEnd);
      };
      handle.addEventListener('ended', onEnd);
    }
  }

  cancelQuiz() {
    this.audio.stopAll();
    this.stopTalking();
    this.router.navigateByUrl('/start');
  }

  // ====== Abbrechen-Modal (während Quiz) ======
  openAbort() {
    this.audio.stopAll();
    this.stopTalking();
    this.showAbort = true;
  }
  closeAbort() {
    this.showAbort = false;
  }
  confirmAbort() {
    this.audio.stopAll();
    this.stopTalking();
    this.router.navigateByUrl('/start');
  }

  // ====== Fragen laden/anzeigen ======
  private async ensureLoaded() {
    if (this.loaded) return;
    const raw = await fetch('/questions.json', { cache: 'no-store' }).then(r => r.json()) as RawQuestion[];

    this.all = raw.map(q => this.toQuestion(q));
    this.totalCount = this.all.length;

    // Optional: Reihenfolge der Fragen leicht mischen
    for (let i = this.all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.all[i], this.all[j]] = [this.all[j], this.all[i]];
    }

    this.loaded = true;
  }

  private toQuestion(q: RawQuestion): Question {
    const answers: Answer[] = q.answers.map((text, i) => ({ text, correct: i === q.correct }));
    // Antworten pro Frage mischen
    for (let i = answers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [answers[i], answers[j]] = [answers[j], answers[i]];
    }
    return { id: q.id, text: q.text, answers };
  }

  private setCurrentFromIndex() {
    const q = this.all[this.qIndex];
    this.current = { text: q.text };
    this.answers = q.answers;
    this.correctIdx = this.answers.findIndex(a => a.correct);
    this.updateProgress();
  }

  private updateProgress() {
    this.progressLabel = this.totalCount
      ? `${Math.min(this.qIndex + 1, this.totalCount)} / ${this.totalCount}`
      : '';
  }

  private async loadQuestion() {
    await this.ensureLoaded();

    if (this.qIndex >= this.all.length) {
      // Ende -> Ergebnis-Seite
      this.router.navigate(['/result'], {
        queryParams: { c: this.correctCount, t: this.totalCount },
      });
      return;
    }

    this.setCurrentFromIndex();
  }

  // ====== Antworten / Nächste ======
  select(i: number) {
    if (this.showFeedback) return;

    this.selected = i;
    this.showFeedback = true;
    this.lastWasCorrect = this.answers[i]?.correct ?? false;

    // Quack-Feedback
    this.audio.stopAll();
    if (this.lastWasCorrect) {
      this.correctCount++;
      this.audio.playEffect('ok');   // 🟢 happy quack
    } else {
      this.audio.playEffect('fail'); // 🔴 angry quack
    }
  }

  async next() {
    if (!this.showFeedback) return;
    this.audio.stopAll();

    this.selected = null;
    this.showFeedback = false;
    this.qIndex++;
    await this.loadQuestion();
  }
}
