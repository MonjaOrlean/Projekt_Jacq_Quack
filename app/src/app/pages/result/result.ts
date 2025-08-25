import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-result',
  standalone: true,
  templateUrl: './result.html',
  styleUrl: './result.css',
})
export class Result implements OnInit {
  score = 0;
  total = 0;
  percent = 0;
  message = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    const s = Number(sessionStorage.getItem('quiz_score') ?? '0');
    const t = Number(sessionStorage.getItem('quiz_total') ?? '0');

    this.score = Number.isFinite(s) ? s : 0;
    this.total = Number.isFinite(t) && t > 0 ? t : 10;
    this.percent = Math.round((this.score / this.total) * 100);

    if (this.percent >= 90) this.message = 'Mega! Bald ballerst du Prof-Niveau.';
    else if (this.percent >= 70) this.message = 'Stark! Weiter so.';
    else if (this.percent >= 50) this.message = 'Gut! Noch ein Durchgang?';
    else this.message = 'Alles gut – beim nächsten Mal wird’s besser. 💪';
  }

  restart() { this.router.navigateByUrl('/start'); }
  logout()  { this.router.navigateByUrl('/credits'); }
}
