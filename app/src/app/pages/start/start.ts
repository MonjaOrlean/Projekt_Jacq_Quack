import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-start',
  standalone: true,
  imports: [NgIf],
  templateUrl: './start.html',
  styleUrls: ['./start.css']
})
export class StartComponent implements OnInit, OnDestroy {
  bgSrc = '/img/Lehrerzimmer.png';
  onBgError() { this.bgSrc = '/assets/img/Lehrerzimmer.png'; }

  frames = [
    '/img/avatar/jacq_closed.png',
    '/img/avatar/jacq_half.png',
    '/img/avatar/jacq_open.png',
    '/img/avatar/jacq_half.png',
  ];
  frameIndex = signal(0);
  speaking = signal(false);
  private mouthTimer?: number;

  showBeforeNineModal = signal(false);
  showWelcomeModal = signal(false);

  private BEFORE9_SRC = '/audio/Jacq text vor 9 Uhr.mp3';
  private INTRO_SRC   = '/audio/Jacq Text Startseite.mp3';

  private beforeNineAudio!: HTMLAudioElement;
  private introAudio!: HTMLAudioElement;

  constructor(private router: Router) {
    this.ensureGlobalAudioKiller();
  }

  ngOnInit(): void {
    const hour = new Date().getHours();

    if (hour < 9) {
      this.showBeforeNineModal.set(true);
      this.showWelcomeModal.set(false);
      this.playBefore9();
    } else {
      this.showBeforeNineModal.set(false);
      this.showWelcomeModal.set(true);
      this.playIntro();
    }
  }

  ngOnDestroy(): void {
    this.stopAllAudio();
    this.stopMouth();
  }

  // === globaler Killer ===
  private ensureGlobalAudioKiller() {
    const w = window as any;
    if (!w.jqAudios) w.jqAudios = new Set<HTMLAudioElement>();
    if (!w.jqRegisterAudio) {
      w.jqRegisterAudio = (a: HTMLAudioElement) => { w.jqAudios.add(a); return a; };
    }
    if (!w.jqHardStopAllAudio) {
      w.jqHardStopAllAudio = () => {
        try {
          (w.jqAudios as Set<HTMLAudioElement>)?.forEach((a: HTMLAudioElement) => {
            try {
              a.pause();
              a.muted = true;
              a.removeAttribute('src');
              a.load();
            } catch {}
          });
          (w.jqAudios as Set<HTMLAudioElement>)?.clear();
        } catch {}
      };
    }
  }

  private makeAudio(src: string): HTMLAudioElement {
    const a = new Audio(encodeURI(src));
    a.loop = false;
    a.onplay = () => this.startMouth();
    a.onpause = () => this.stopMouth();
    a.onended = () => this.stopMouth();
    (window as any).jqRegisterAudio?.(a);
    return a;
  }

  private stopAllAudio() {
    (window as any).jqHardStopAllAudio?.();
  }

  private async playBefore9() {
    this.stopAllAudio();
    this.beforeNineAudio = this.makeAudio(this.BEFORE9_SRC);
    try { await this.beforeNineAudio.play(); } catch {}
  }

  private async playIntro() {
    this.stopAllAudio();
    this.introAudio = this.makeAudio(this.INTRO_SRC);
    try { await this.introAudio.play(); } catch {}
  }

  repeatBefore9() { this.playBefore9(); }
  repeatIntro()   { this.playIntro(); }

  // Mund-Animation
  private startMouth() {
    this.speaking.set(true);
    this.stopMouth();
    this.mouthTimer = window.setInterval(() => {
      this.frameIndex.set((this.frameIndex() + 1) % this.frames.length);
    }, 140);
  }
  private stopMouth() {
    this.speaking.set(false);
    if (this.mouthTimer) {
      clearInterval(this.mouthTimer);
      this.mouthTimer = undefined;
    }
    this.frameIndex.set(0);
  }

  // Aktionen
  confirmBeforeNine() {
    this.stopAllAudio();
    this.showBeforeNineModal.set(false);
    this.showWelcomeModal.set(true);
    this.playIntro();
  }

  onStartClicked() {
    this.stopAllAudio();
    this.router.navigate(['/quiz']);
  }

  logout() {
    this.stopAllAudio();
    this.router.navigate(['/credits']);
  }
}
