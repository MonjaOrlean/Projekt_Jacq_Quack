import { Component, OnInit, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-account',
  standalone: true,
  templateUrl: './account.html',
  styleUrls: ['./account.css'],
  imports: [NgIf, FormsModule],
})
export class AccountComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  user: { username: string; email?: string } | null = null;

  confirmName = '';
  password = '';
  busy = false;
  msg = '';
  err = '';

  ngOnInit() {
    const u = this.auth.currentUser;
    this.user = u ? { username: u.username, email: u.email } : null;
  }

  get canDelete() {
    return (
      !!this.user &&
      this.confirmName.trim().toLowerCase() === this.user.username.toLowerCase() &&
      this.password.trim().length > 0
    );
  }

  async onDelete() {
    if (!this.canDelete || !this.password) return;
    this.err = '';
    this.msg = '';
    this.busy = true;
    try {
      await this.auth.deleteOwnAccount(this.password);
      this.msg = 'Konto wurde gelöscht.';
      await this.router.navigateByUrl('/login');
    } catch (e: any) {
      this.err = e?.message ?? 'Löschen fehlgeschlagen.';
    } finally {
      this.busy = false;
    }
  }
}
