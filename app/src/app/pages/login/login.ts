import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  imports: [FormsModule, NgIf],
})
export class LoginComponent {
  username = '';
  password = '';
  showPassword = false;
  loading = false;
  msg = '';

  constructor(private auth: AuthService, private router: Router) {}

  togglePw() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    this.msg = '';
    if (!this.username || !this.password) {
      this.msg = 'Bitte Benutzername und Passwort eingeben.';
      return;
    }

    this.loading = true;
    try {
      await this.auth.login(this.username.trim(), this.password);
      await this.router.navigateByUrl('/start');
    } catch (e: any) {
      this.msg = e?.message ?? 'Login fehlgeschlagen.';
    } finally {
      this.loading = false;
    }
  }
}
