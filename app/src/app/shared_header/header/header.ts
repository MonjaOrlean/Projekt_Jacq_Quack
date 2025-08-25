import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';

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

  // Audio
  private quackLow?: HTMLAudioElement;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.t = window.setInterval(() => this.time.set(this.nowHHMM()), 1000);
    try {
      // WICHTIG: du hast die Dateien unter app/public/audio/ abgelegt
      this.quackLow = new Audio('/audio/quack_tief.wav'); // tiefer Quack
      this.quackLow.volume = 0.4;
      this.quackLow.preload = 'auto';
    } catch {}
  }

  ngOnDestroy(): void {
    if (this.t) clearInterval(this.t);
  }

  private nowHHMM(): string {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2,'0');
    const mm = String(d.getMinutes()).padStart(2,'0');
    return `${hh}:${mm}`;
  }

  onDuck() {
    // Easter-Egg (heller Quack) kommt im nächsten Schritt
    console.log('🦆 quack!');
  }

  onAbort() {
    this.showAbort = true;
    // Klick ist ein User-Gesture → Audio darf spielen
    try { this.quackLow?.play().catch(() => {}); } catch {}
  }

  keepGoing() { // „Nein, weiter ballern“
    this.showAbort = false;
  }

  confirmAbort() { // „Ja, aufgeben“ → zurück zu Start
    this.showAbort = false;
    this.router.navigateByUrl('/start');
  }

  onLogout() { // Logout → Abspann
    this.router.navigateByUrl('/credits');
  }
}
