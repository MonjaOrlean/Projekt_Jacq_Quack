import { Component, Input, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-avatar',
  standalone: true,
  templateUrl: './avatar.html',
  styleUrl: './avatar.css',
})
export class Avatar implements OnDestroy {
  /** Größe: Zahl (px) ODER CSS-String (z.B. "clamp(260px, 32vw, 820px)") */
  @Input() size: number | string = 320;

  /** CSS-Wert für --size ableiten */
  get sizeCss(): string {
    return typeof this.size === 'number' ? `${this.size}px` : this.size;
  }

  /** Reihenfolge der Mund-Frames (transparentes PNG!) */
  private frames = [
    '/img/avatar/jacq_closed.png',
    '/img/avatar/jacq_half.png',
    '/img/avatar/jacq_open.png',
  ];
  current = this.frames[0];

  private iv?: number;
  private stopTo?: number;
  private pulseTo?: number;
  talking = false;

  /** Gleichmäßige Animation – optional beim Anklicken */
  startTalking(ms = 2400) {
    if (this.talking) return;
    this.talking = true;
    let i = 0;
    this.iv = window.setInterval(() => {
      i = (i + (Math.random() < 0.5 ? 1 : 2)) % this.frames.length;
      this.current = this.frames[i];
    }, 120);
    this.stopTo = window.setTimeout(() => this.stopTalking(), ms) as unknown as number;
  }

  /** Stoppt Animation und setzt Mund zu */
  stopTalking() {
    if (this.iv) { clearInterval(this.iv); this.iv = undefined; }
    if (this.stopTo) { clearTimeout(this.stopTo); this.stopTo = undefined; }
    if (this.pulseTo) { clearTimeout(this.pulseTo); this.pulseTo = undefined; }
    this.current = this.frames[0];
    this.talking = false;
  }

  /** Kurzer Impuls pro Wortgrenze (natürlichere Lippenbewegung) */
  pulse() {
    const idx = this.frames.indexOf(this.current);
    this.current = this.frames[(idx + 1) % this.frames.length];
    if (this.pulseTo) clearTimeout(this.pulseTo);
    this.pulseTo = window.setTimeout(() => {
      this.current = this.frames[0];
    }, 85) as unknown as number;
  }

  ngOnDestroy(): void {
    if (this.iv) clearInterval(this.iv);
    if (this.stopTo) clearTimeout(this.stopTo);
    if (this.pulseTo) clearTimeout(this.pulseTo);
  }
}
