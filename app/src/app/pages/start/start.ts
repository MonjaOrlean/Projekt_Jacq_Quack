import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { Avatar } from '../../shared/avatar/avatar';

@Component({
  selector: 'app-start',
  standalone: true,
  templateUrl: './start.html',
  styleUrl: './start.css',
  imports: [RouterLink, NgIf, Avatar],
})
export class Start implements OnInit, AfterViewInit {
  // Vor-9-Uhr Hinweis
  earlyWarn = false;

  // Intro-Overlay
  showIntro = true;

  // TTS
  ttsAvailable = 'speechSynthesis' in window;
  ttsBlocked = false;
  speaking = false;

  @ViewChild('introAv') introAv?: Avatar;

  // responsive Größe für den Avatar (nutzt CSS clamp())
  clampSize(minPx: number, vw: number, maxPx: number){
    return `clamp(${minPx}px, ${vw}vw, ${maxPx}px)`;
  }

  ngOnInit(): void {
    const hour = new Date().getHours();
    const alreadyWarned = sessionStorage.getItem('warned_before9') === '1';
    this.earlyWarn = hour < 9 && !alreadyWarned;
    this.showIntro = true;
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.speakIntroAuto(), 350);
  }

  dismissEarlyWarn() {
    this.earlyWarn = false;
    sessionStorage.setItem('warned_before9', '1');
  }

  closeIntro() {
    this.stopSpeak();
    this.showIntro = false;
    this.introAv?.stopTalking();
  }

  // ===== Stimme auswählen: deutsch, männlich, möglichst natürlich =====
  private pickNaturalGermanMale(): SpeechSynthesisVoice | null {
    const voices = speechSynthesis.getVoices() || [];
    const isDE = (v: SpeechSynthesisVoice) => (v.lang || '').toLowerCase().startsWith('de');
    const de = voices.filter(isDE);

    const preferNames = [
      'Google Deutsch', 'Google de-DE',
      'Microsoft Stefan', 'Microsoft Jonas', 'Microsoft Conrad', 'Microsoft Killian',
      'Natural', 'Neural', 'Wavenet-B', 'Standard-B',
    ];
    const byName = (needle: string) =>
      de.find(v => (v.name || '').includes(needle) || (v.voiceURI || '').includes(needle));
    for (const n of preferNames) {
      const hit = byName(n);
      if (hit) return hit;
    }

    const maleish = /male|mann|stefan|jonas|conrad|killian|standard[- ]?b|wavenet[- ]?b|neural[- ]?b/i;
    const localFirst = de.sort((a,b) => ((b as any).localService?1:0) - ((a as any).localService?1:0));
    const male = localFirst.find(v => maleish.test((v.name||'') + ' ' + (v.voiceURI||'')));
    return male || de[0] || voices[0] || null;
  }

  // ===== Gesprochener Text (AKTUALISIERT NACH DEINEM HTML) =====
  private buildUtterance(): SpeechSynthesisUtterance {
    const text =
      // Tipp: „Schak“ hilft manchen Engines bei französischer Aussprache von "Jacques"
      'Hallo zusammen! ' +
      'Mein Name ist Jacques Löhr. ' +
      'Für viele bin ich auch bekannt als: Jacques die Coder-Puppe. ' +
      'Ich bin Dozent für deinen Programmierunterricht. ' +
      'Bist du bereit, hier jetzt und sofort durchs Quiz zu ballern?';

    const u = new SpeechSynthesisUtterance(text);

    const voice = this.pickNaturalGermanMale();
    if (voice) { u.voice = voice; u.lang = voice.lang || 'de-DE'; }
    else { u.lang = 'de-DE'; }

    // sanft, warm, natürlich
    u.rate   = 0.95;  // etwas langsamer
    u.pitch  = 1.02;  // leicht hell, aber nicht künstlich
    u.volume = 0.98;

    // Lippenbewegung an Wortgrenzen („natürlichere“ Animation)
    u.onboundary = () => this.introAv?.pulse();

    u.onstart = () => { this.speaking = true; this.introAv?.startTalking(8000); };
    const stop = () => { this.speaking = false; this.introAv?.stopTalking(); };
    u.onend = stop;
    u.onerror = stop;

    return u;
  }

  private speak(u: SpeechSynthesisUtterance) {
    try {
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
      setTimeout(() => { if (!this.speaking) this.ttsBlocked = true; }, 900);
    } catch { this.ttsBlocked = true; }
  }

  speakIntroAuto() {
    if (!this.ttsAvailable) return;
    if (speechSynthesis.getVoices().length === 0) {
      const h = () => { speechSynthesis.onvoiceschanged = null; this.speak(this.buildUtterance()); };
      speechSynthesis.onvoiceschanged = h;
      setTimeout(() => { if (speechSynthesis.onvoiceschanged) h(); }, 500);
      return;
    }
    this.speak(this.buildUtterance());
  }

  speakIntroManual() {
    this.ttsBlocked = false;
    this.speak(this.buildUtterance());
  }

  stopSpeak() {
    try { speechSynthesis.cancel(); } catch {}
    this.speaking = false;
  }
}
