import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-start',
  standalone: true,
  templateUrl: './start.html',
  styleUrl: './start.css',
  imports: [NgIf],
})
export class Start {
  showEarly = false;

  constructor(private router: Router) {}

  onYes() {
    const before9 = new Date().getHours() < 9;
    const seen = sessionStorage.getItem('seenEarlyHint') === '1';
    if (before9 && !seen) {
      this.showEarly = true;
      sessionStorage.setItem('seenEarlyHint', '1');
      return;
    }
    this.router.navigateByUrl('/quiz');
  }

  confirmEarly() {
    this.showEarly = false;
    this.router.navigateByUrl('/quiz');
  }

  onNo() {
    this.router.navigateByUrl('/login');
  }
}
