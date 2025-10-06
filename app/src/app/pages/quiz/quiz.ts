import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { AudioService } from '../../shared/services/audio.service';

interface Answer {
  text: string;
  correct: boolean;
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

  // Abbrechen-Modal („feige Ente?“)
  showAbort = false;

  // Avatar-Frames (Mundbewegung)
  frames = ['/img/avatar/jacq_closed.png', '/img/avatar/jacq_half.png', '/img/avatar/jacq_open.png'];
  idx = 0;
  private talkTimer?: number;     // setInterval Handle
  private talking = false;        // Zustand

  // Frage/Daten
  current: { text: string } | null = null;
  answers: Answer[] = [];
  correctIdx = -1;
  selected: number | null = null;
  showFeedback = false;
  lastWasCorrect = false;
  msg = '';
  progressLabel = '';

  constructor(private router: Router, private audio: AudioService) {}

  // ====== Lebenszyklus ======
  ngOnInit(): void {
    // Beim Aufruf Intro automatisch vorlesen lassen (wenn Autoplay erlaubt)
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

  // ====== Avatar reden lassen ======
  private startTalking() {
    if (this.talking) return;
    this.talking = true;
    this.talkTimer = window.setInterval(() => {
      // 0 -> 1 -> 2 -> 1 -> 0 ...
      this.idx = (this.idx + 1) % this.frames.length;
    }, 120);
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
  startQuiz() {
    this.askCoffee = false;
    this.audio.stopAll();
    this.stopTalking();
    this.loadQuestion();
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

  // ====== Antworten/Nächste ======
  select(i: number) {
    if (this.showFeedback) return;
    this.selected = i;
    this.showFeedback = true;
    this.lastWasCorrect = this.answers[i]?.correct ?? false;
    if (!this.lastWasCorrect) this.msg = '';
  }

  next() {
    this.selected = null;
    this.showFeedback = false;
    this.loadQuestion();
  }

  // ====== Dummy-Frage (ersetze mit deiner JSON-Logik) ======
  private loadQuestion() {
    this.current = { text: 'Wie heißt die Hauptstadt von Frankreich?' };
    this.answers = [
      { text: 'Berlin', correct: false },
      { text: 'Paris',  correct: true  },
      { text: 'Rom',    correct: false },
      { text: 'Madrid', correct: false },
    ];
    this.correctIdx = 1;
    this.progressLabel = '1 / 10';
  }
}
