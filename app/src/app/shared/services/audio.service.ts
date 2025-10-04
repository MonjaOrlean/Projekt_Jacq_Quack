import { Injectable } from '@angular/core';

type SoundKey = 'happy' | 'angry' | 'neutral';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private readonly STORAGE_VOLUME = 'jq_volume';
  private readonly STORAGE_MUTED = 'jq_muted';

  private base: Record<SoundKey, HTMLAudioElement> = {
    happy: new Audio('/audio/ente_happy.mp3'),
    angry: new Audio('/audio/ente_angry.mp3'),
    neutral: new Audio('/audio/ente_neutral.mp3'),
  };

  private _volume = 0.6; // 0..1
  private _muted = false;

  constructor() {
    // Vorladen & Standardwerte anwenden
    (Object.keys(this.base) as SoundKey[]).forEach(k => {
      this.base[k].preload = 'auto';
      this.base[k].volume = this._volume;
      this.base[k].muted = this._muted;
    });

    // Einstellungen aus localStorage laden
    const v = localStorage.getItem(this.STORAGE_VOLUME);
    const m = localStorage.getItem(this.STORAGE_MUTED);
    if (v !== null) {
      const num = Number(v);
      if (!Number.isNaN(num)) this.setVolume(num);
    }
    if (m !== null) {
      this.setMuted(m === 'true');
    }
  }

  get volume(): number {
    return this._volume;
  }

  get muted(): boolean {
    return this._muted;
  }

  setVolume(v: number): void {
    const vol = Math.min(1, Math.max(0, v));
    this._volume = vol;
    (Object.keys(this.base) as SoundKey[]).forEach(k => (this.base[k].volume = vol));
    localStorage.setItem(this.STORAGE_VOLUME, String(vol));
  }

  setMuted(m: boolean): void {
    this._muted = m;
    (Object.keys(this.base) as SoundKey[]).forEach(k => (this.base[k].muted = m));
    localStorage.setItem(this.STORAGE_MUTED, String(m));
  }

  toggleMute(): void {
    this.setMuted(!this._muted);
  }

  /** Spielt eine Kopie ab, damit Overlaps möglich sind */
  private play(name: SoundKey): void {
    const original = this.base[name];
    if (!original) return;

    const clone = original.cloneNode(true) as HTMLAudioElement;
    clone.volume = this._volume;
    clone.muted = this._muted;
    // Fehler beim Autoplay ignorieren (z. B. wenn Browser noch keine Interaktion hatte)
    clone.play().catch(() => {});
  }

  playHappy(): void { this.play('happy'); }
  playAngry(): void { this.play('angry'); }
  playNeutral(): void { this.play('neutral'); }
}
