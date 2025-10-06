import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-credits',
  standalone: true,
  templateUrl: './credits.html',
  styleUrls: ['./credits.css'],
})
export class CreditsComponent implements OnInit, OnDestroy {
  private durationMs = 60000;
  private timer?: number;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Beim Betreten der Credits ALLES endgültig abschießen
    (window as any).jqHardStopAllAudio?.();

    document.documentElement.style.setProperty('--roll-duration', `${this.durationMs / 1000}s`);
    this.timer = window.setTimeout(() => this.toLogin(), this.durationMs);
  }

  ngOnDestroy(): void {
    if (this.timer) clearTimeout(this.timer);
  }

  toLogin(): void {
    this.router.navigateByUrl('/login');
  }
}
