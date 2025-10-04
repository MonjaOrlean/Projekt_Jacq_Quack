// src/app/shared_header/header/header.ts
import { Component, inject, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
  imports: [RouterLink, NgIf],
})
export class HeaderComponent implements OnDestroy {
  private router = inject(Router);
  private auth = inject(AuthService);

  now = this.formatTime(new Date());
  private t = setInterval(() => (this.now = this.formatTime(new Date())), 1000);

  currentUrl = this.router.url;

  // Logout-Modal
  showLogoutConfirm = false;

  constructor() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe((e: any) => (this.currentUrl = e.urlAfterRedirects || e.url || this.router.url));
  }

  ngOnDestroy() { clearInterval(this.t); }

  // Sichtbarkeiten
  get isLogin(): boolean {
    const u = this.currentUrl || '';
    // nur auf /login die Registrieren-Schaltfläche zeigen
    return u === '/login' || u.startsWith('/login');
  }

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn;
  }

  // Buttons oben rechts
  openLogoutConfirm() { this.showLogoutConfirm = true; }
  stayLoggedIn() { this.showLogoutConfirm = false; }
  confirmLogout() {
    try { this.auth.logout(); } catch {}
    this.showLogoutConfirm = false;
    this.router.navigateByUrl('/login');
  }

  private formatTime(d: Date) {
    return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }
}
