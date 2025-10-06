import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-result',
  standalone: true,
  templateUrl: './result.html',
  styleUrls: ['./result.css'],
  imports: [CommonModule, RouterLink],
})
export class ResultComponent implements OnInit {
  correct = 0;
  total = 0;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    // 1) Versuch: aus Query-Parametern (?c=…&t=…)
    const qp = this.route.snapshot.queryParamMap;
    const c = Number(qp.get('c'));
    const t = Number(qp.get('t'));

    if (Number.isFinite(c) && Number.isFinite(t) && t > 0) {
      this.correct = c;
      this.total = t;
      // zusätzlich sichern, falls man F5 drückt
      try { sessionStorage.setItem('jq_result', JSON.stringify({ correct: c, total: t })); } catch {}
      return;
    }

    // 2) Fallback: aus sessionStorage (z.B. bei Reload)
    try {
      const raw = sessionStorage.getItem('jq_result');
      if (raw) {
        const parsed = JSON.parse(raw);
        const cc = Number(parsed?.correct);
        const tt = Number(parsed?.total);
        if (Number.isFinite(cc) && Number.isFinite(tt) && tt > 0) {
          this.correct = cc;
          this.total = tt;
          return;
        }
      }
    } catch {
      // ignore
    }

    // 3) Letzter Fallback: 0/0
    this.correct = 0;
    this.total = 0;
  }

  retry() {
    this.router.navigateByUrl('/quiz');
  }

  backToStart() {
    this.router.navigateByUrl('/start');
  }

  get resultText(): string {
    return `Du hast ${this.correct} von ${this.total} Fragen richtig beantwortet!`;
  }
}
