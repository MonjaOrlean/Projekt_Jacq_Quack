import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-start',
  standalone: true,
  templateUrl: './start.html',
  styleUrls: ['./start.css'],
  imports: [NgIf],
})
export class StartComponent implements OnInit, OnDestroy {
  // --- Hintergrund (für [src] im Template) ---
  bgSrc = '/img/Lehrerzimmer.png';

  // --- Jacq-Frames (Mund) ---
  frames = [
    '/img/avatar/jacq_closed.png',
    '/img/avatar/jacq_half.png',
    '/img/avatar/jacq_open.png',
    '/img/avatar/jacq_half.png',
  ];
  private mouthTimer?: number;
  frameIndex = 0;

  // --- Audio: Intro + Vor-9-Uhr ---
  // URL-encode, falls Dateinamen Leerzeichen enthalten
  private introUrl = encodeURI('/audio/Jacq Text Startseite.mp3');
  private before9Url = encodeURI('/audio/Jacq text vor 9 Uhr.mp3');
  private introAudio = new Audio(this.introUrl);
  private before9Audio = new Audio(this.before9Url);

  // --- Vor 9 Uhr Logik ---
  showBeforeNineModal = false;
  private beforeNineKey = 'jq_before9_ack'; // wird auf '1' gesetzt, sobald bestätigt
  private get isBeforeNine(): boolean {
    const h = new Date().getHours();
    return h < 9;
  }

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Audio vorbereiten
    try {
      this.introAudio.preload = 'auto';
      this.before9Audio.preload = 'auto';
      this.introAudio.load();
      this.before9Audio.load();
    } catch {}

    // Wenn es noch vor 9 Uhr ist und nicht bestätigt wurde → erst die Warnkarte
    const ack = sessionStorage.getItem(this.beforeNineKey) === '1';
    if (this.isBeforeNine && !ack) {
      this.openBeforeNineCard();
    } else {
      this.playIntro();
    }
  }

  ngOnDestroy(): void {
    this.stopMouth();
    try { this.introAudio.pause(); } catch {}
    try { this.before9Audio.pause(); } catch {}
  }

  // ===== Mund-Animation =====
  private startMouth() {
    this.stopMouth();
    this.mouthTimer = window.setInterval(() => {
      this.frameIndex = (this.frameIndex + 1) % this.frames.length;
    }, 140);
  }
  private stopMouth() {
    if (this.mouthTimer) {
      clearInterval(this.mouthTimer);
      this.mouthTimer = undefined;
    }
    this.frameIndex = 0;
  }

  // ===== Intro (normale Start-Ansage) =====
  private playIntro() {
    this.stopMouth();
    try {
      this.introAudio.currentTime = 0;
      this.introAudio.onplay = () => this.startMouth();
      this.introAudio.onended = () => this.stopMouth();
      this.introAudio.play().catch(() => {});
    } catch {}
  }
  repeatIntro() {
    this.playIntro();
  }

  // ===== Vor 9 Uhr Karte =====
  private openBeforeNineCard() {
    this.showBeforeNineModal = true;
    this.playBefore9();
  }

  playBefore9() {
    // Vor-9-Uhr-Text abspielen
    try {
      this.before9Audio.currentTime = 0;
      this.before9Audio.onplay = () => this.startMouth();
      this.before9Audio.onended = () => this.stopMouth();
      this.before9Audio.play().catch(() => {});
    } catch {}
  }

  confirmBeforeNine() {
    this.showBeforeNineModal = false;
    try { sessionStorage.setItem(this.beforeNineKey, '1'); } catch {}
    // Danach normales Intro sprechen lassen
    this.playIntro();
  }

  // ===== Navigation =====
  onStartClicked() {
    // Falls jemand direkt startet, aber noch vor 9 Uhr + nicht bestätigt → Karte zeigen
    const ack = sessionStorage.getItem(this.beforeNineKey) === '1';
    if (this.isBeforeNine && !ack) {
      this.openBeforeNineCard();
      return;
    }
    this.router.navigateByUrl('/quiz');
  }
}
