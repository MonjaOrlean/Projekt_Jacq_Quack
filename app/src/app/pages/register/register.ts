import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
  imports: [FormsModule, NgIf],
})
export class RegisterComponent {
  username = '';
  password = '';
  firstname = '';
  lastname = '';
  birthYear?: number;     // im Template als Zahlfeld
  email = '';

  loading = false;
  msg = '';

  constructor(private router: Router) {}

  async onSubmit() {
    this.msg = '';
    this.loading = true;
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: this.username.trim(),
          password: this.password,
          firstname: this.firstname.trim(),
          lastname: this.lastname.trim(),
          // WICHTIG: Backend erwartet 'birthyear'
          birthyear: Number(this.birthYear),
          email: this.email.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.msg ?? 'Registrierung fehlgeschlagen.');
      this.msg = 'Registrierung erfolgreich. Bitte einloggen.';
      // optional auto-redirect:
      setTimeout(() => this.router.navigateByUrl('/login'), 800);
    } catch (e: any) {
      this.msg = e?.message ?? 'Registrierung fehlgeschlagen.';
    } finally {
      this.loading = false;
    }
  }
}
