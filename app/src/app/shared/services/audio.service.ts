import { Injectable } from '@angular/core';

export type SoundKey =
  | 'quizIntro'
  | 'happy'
  | 'angry'
  | 'click';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private audios = new Map<SoundKey, HTMLAudioElement>();

  constructor() {
    // Pfade: liegen bei dir unter /public/audio/...
    this.audios.set('quizIntro', new Audio('/audio/quiz_intro.mp3'));
    this.audios.set('happy',    new Audio('/audio/ente_happy.mp3'));
    this.audios.set('angry',    new Audio('/audio/ente_angry.mp3'));
    this.audios.set('click',    new Audio('/audio/ente_neutral.mp3'));

    this.audios.forEach(a => {
      a.preload = 'auto';
      a.volume  = 1;
    });
  }

  /** Spielt einen Sound. Stoppt vorher alle. */
  public play(key: SoundKey): Promise<void> {
    this.stopAll();
    const a = this.audios.get(key);
    if (!a) return Promise.resolve();
    try {
      a.currentTime = 0;
      return a.play().catch(() => {});
    } catch { return Promise.resolve(); }
  }

  /**
   * Spielt einen Sound und gibt das HTMLAudioElement zurück,
   * damit der Aufrufer auf 'ended' hören kann.
   */
  public playWithHandle(key: SoundKey): HTMLAudioElement | null {
    this.stopAll();
    const a = this.audios.get(key) ?? null;
    if (!a) return null;
    try {
      a.currentTime = 0;
      a.play().catch(() => {});
    } catch {}
    return a;
  }

  /** Stoppt *alle* Audios sofort. */
  public stopAll(): void {
    this.audios.forEach(a => {
      try {
        a.pause();
        a.currentTime = 0;
      } catch {}
    });
  }
}
