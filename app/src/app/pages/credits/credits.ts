import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-credits',
  standalone: true,
  templateUrl: './credits.html',
  styleUrls: ['./credits.css'],
})
export class CreditsComponent implements OnInit {
  /** Sekunden bis zur automatischen Weiterleitung */
  durationSec = 22;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Prüfen, ob wir von „Logout“ kommen (optional – zur Info/Styling)
    const nav = this.router.getCurrentNavigation();
    const after = (nav?.extras?.state as any)?.after;

    // Auto-Weiterleitung zur Login-Seite
    setTimeout(() => {
      this.router.navigateByUrl('/login');
    }, this.durationSec * 1000);
  }
}
