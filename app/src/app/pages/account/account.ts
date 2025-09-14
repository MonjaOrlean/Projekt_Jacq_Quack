import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../shared/services/auth.service';

@Component({
  selector: 'app-account',
  standalone: true,
  templateUrl: './account.html',
  styleUrls: ['./account.css'],
})
export class AccountComponent {
  user: User | null = null;
  confirmName = '';
  busy = false;
  msg = '';

  constructor(private auth: AuthService, private router: Router) {
    // Getter – ohne ()
    this.user = this.auth.currentUser;
  }

  async onDelete() {
    this.msg = '';
    if (!this.user) return;

    if (this.confirmName.trim() !== this.user.username) {
      this.msg = 'Bitte den Benutzernamen exakt bestätigen.';
      return;
    }

    this.busy = true;
    try {
      await this.auth.deleteAccount(this.user.username);
      this.router.navigateByUrl('/login');
    } catch (e: any) {
      this.msg = e?.message || 'Löschen fehlgeschlagen.';
    } finally {
      this.busy = false;
    }
  }
}
