import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-result',
  standalone: true,
  templateUrl: './result.html',
  styleUrls: ['./result.css'],
  // keine imports nötig, wir verwenden im Template kein *ngIf
})
export class ResultComponent implements OnInit {
  correct = 0;
  total = 0;

  constructor(private router: Router) {}

  ngOnInit() {
    // 1) bevorzugt: Navigation State
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as { correct: number; total: number } | undefined;

    if (state && typeof state.correct === 'number' && typeof state.total === 'number') {
      this.correct = state.correct;
      this.total = state.total;
    } else {
      // 2) Fallback: SessionStorage
      try {
        const raw = sessionStorage.getItem('jq_result');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (typeof parsed?.correct === 'number') this.correct = parsed.correct;
          if (typeof parsed?.total === 'number') this.total = parsed.total;
        }
      } catch {}
    }
  }

  retry() { this.router.navigateByUrl('/quiz'); }
  backToStart() { this.router.navigateByUrl('/start'); }

  get resultText() {
    return `Du hast ${this.correct} von ${this.total} Fragen richtig beantwortet!`;
  }
}
