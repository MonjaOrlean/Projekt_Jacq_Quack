import { Component, OnDestroy, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
  imports: [RouterLink, NgIf]
})
export class Header implements OnDestroy {
  private router = inject(Router);

  timeStr = this.formatTime(new Date());
  private timer = setInterval(() => this.timeStr = this.formatTime(new Date()), 1000);

  get onLogin(): boolean {
    return this.router.url.startsWith('/login');
  }

  openRegister(): void {
    // Login-Seite kann darauf hören und das Modal öffnen
    window.dispatchEvent(new CustomEvent('open-register'));
  }

  private formatTime(d: Date): string {
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }
}
