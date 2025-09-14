import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
  imports: [FormsModule, NgIf],
})
export class RegisterComponent {
  // Formularfelder
  username = '';
  password = '';
  password2 = '';
  email = '';
  firstName = '';
  lastName = '';
  birthYear: number | null = null;

  showPw = false;
  showPw2 = false;
  busy = false;
  msg = '';
  ok = '';

  constructor(private auth: AuthService, private router: Router) {}

  togglePw(which: 1 | 2) {
    if (which === 1) this.showPw = !this.showPw;
    else this.showPw2 = !this.showPw2;
  }

  async onSubmit() {
    this.msg = '';
    this.ok = '';

    // Basale Validierung
    if (!this.username || !this.password || !this.password2 || !this.email || !this.firstName || !this.lastName || !this.birthYear) {
      this.msg = 'Bitte alle Felder ausfüllen.';
      return;
    }
    if (this.password.length < 6) {
      this.msg = 'Passwort mindestens 6 Zeichen.';
      return;
    }
    if (this.password !== this.password2) {
      this.msg = 'Passwörter stimmen nicht überein.';
      return;
    }
    if (this.birthYear < 1900 || this.birthYear > new Date().getFullYear()) {
      this.msg = 'Bitte ein plausibles Geburtsjahr angeben.';
      return;
    }

    this.busy = true;
    try {
      await this.auth.register({
        username: this.username.trim(),
        password: this.password,
        email: this.email.trim(),
        firstName: this.firstName.trim(),
        lastName: this.lastName.trim(),
        birthYear: Number(this.birthYear),
      });

      this.ok = 'Registrierung erfolgreich! Du kannst dich jetzt einloggen.';
      setTimeout(() => this.router.navigateByUrl('/login'), 800);
    } catch (e: any) {
      this.msg = e?.message ?? 'Registrierung fehlgeschlagen.';
    } finally {
      this.busy = false;
    }
  }
}
