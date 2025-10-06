import { Injectable } from '@angular/core';

/**
 * Einheitlicher Audio-Service:
 * - playWithHandle(key): startet eine Audio-Datei und gibt das HTMLAudioElement zurück
 * - playEffect('ok'|'fail'): spielt kurzes Quack (happy/angry)
 * - stopAll(): stoppt ALLE gerade laufenden Sounds dieses Services
 *
 * Pfade passen zu /app/public/audio/...
 */
type AudioKey = 'quizIntro' | 'duckHappy' | 'duckAngry';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private current?: HTMLAudioElement;

  private srcMap: Record<AudioKey, string> = {
    quizIntro: '/audio/quiz_intro.mp3',
    duckHappy: '/audio/ente_happy.mp3',
    duckAngry: '/audio/ente_angry.mp3',
  };

  /**
   * Startet Audio anhand Schlüssel und gibt das HTMLAudioElement zurück (oder null).
   * Vorher werden laufende Audios dieses Services gestoppt.
   */
  playWithHandle(key: AudioKey): HTMLAudioElement | null {
    const src = this.srcMap[key];
    if (!src) return null;

    this.stopAll();

    try {
      const a = new Audio(src);
      a.volume = 1;
      a.play().catch(() => {});
      this.current = a;
      return a;
    } catch {
      return null;
    }
  }

  /** Kurzer Effekt für Quiz-Feedback */
  playEffect(kind: 'ok' | 'fail'): void {
    const key: AudioKey = kind === 'ok' ? 'duckHappy' : 'duckAngry';
    this.playWithHandle(key);
  }

  /** Stoppt das aktuell im Service laufende Audio (falls vorhanden). */
  stopAll(): void {
    try {
      if (this.current) {
        this.current.pause();
        this.current.currentTime = 0;
        this.current.src = '';
        this.current.load();
        this.current = undefined;
      }
    } catch {
      /* noop */
    }
  }
}
