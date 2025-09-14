// src/app/shared/services/auth.service.ts
import { Injectable } from '@angular/core';

export interface User {
  username: string;
  role: 'user' | 'admin';
  email: string;
  firstName?: string;
  lastName?: string;
  birthYear?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  /** aktuell eingeloggter User (oder null) */
  public currentUser: User | null = null;

  /** Login gegen die JSON-API */
  async login(username: string, password: string): Promise<void> {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      // Fehlermeldung (falls vorhanden) aus dem Backend holen
      let msg = 'Login fehlgeschlagen.';
      try {
        const j = await res.json();
        if (j?.message) msg = j.message;
      } catch {}
      throw new Error(msg);
    }

    // Backend liefert z.B. { user: { ... } }
    const data = await res.json();
    this.currentUser = data.user as User;
  }

  logout(): void {
    this.currentUser = null;
  }

  /** Registrierung gegen die JSON-API */
  async register(payload: {
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    birthYear: number;
  }): Promise<void> {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let msg = 'Registrierung fehlgeschlagen.';
      try {
        const j = await res.json();
        if (j?.message) msg = j.message;
      } catch {}
      throw new Error(msg);
    }
  }
}
