import { Component, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
  imports: [RouterLink, NgIf],
})
export class HeaderComponent implements OnDestroy {
  now = this.formatTime(new Date());
  private t = setInterval(() => (this.now = this.formatTime(new Date())), 1000);

  currentUrl = '';

  showLogoutConfirm = false;
  deleteStep = 0;

  constructor(private router: Router) {
    this.currentUrl = this.router.url;
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => (this.currentUrl = e.urlAfterRedirects || e.url || this.router.url));
  }

  ngOnDestroy() { clearInterval(this.t); }

  // Login-Seite?
  get isLogin(): boolean {
    const u = this.currentUrl || '';
    return u === '/login' || u.startsWith('/login');
  }

  // Von header.html verwendet
  get hasUser(): boolean {
    // Minimal-Variante: Zeige Logout/Account überall, außer auf /login
    return !this.isLogin;
    // Falls du echten Login-Zustand willst:
    // return !!sessionStorage.getItem('jq_user');
  }

  // --- Logout Flow ---
  openLogoutConfirm() {
    this.showLogoutConfirm = true;
    document.dispatchEvent(new CustomEvent('jq-open-logout'));
  }

  stayLoggedIn() {
    this.showLogoutConfirm = false;
    document.dispatchEvent(new CustomEvent('jq-cancel-logout'));
  }

  confirmLogout() {
    document.dispatchEvent(new CustomEvent('jq-confirm-logout'));
    this.showLogoutConfirm = false;
    this.router.navigateByUrl('/credits'); // danach in credits.ts weiter zur /login
  }

  private formatTime(d: Date) {
    return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }
}
