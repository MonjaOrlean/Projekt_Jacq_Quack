// src/app/shared/services/auth.service.ts
import { Injectable } from '@angular/core';

export interface User {
  username: string;
  role: 'user' | 'admin';
  email?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private STORAGE_KEY = 'jq_user';
  private _user: User | null = null;

  constructor() {
    // Session wiederherstellen
    try {
      const raw = sessionStorage.getItem(this.STORAGE_KEY);
      if (raw) this._user = JSON.parse(raw);
    } catch {}
  }

  // ---- Zustand / Getter -----------------------------------------------------
  get currentUser(): User | null {
    return this._user;
  }

  get isLoggedIn(): boolean {
    return !!this._user;
  }

  // ---- Auth-Funktionen ------------------------------------------------------
  async login(username: string, password: string): Promise<void> {
    const res = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username?.trim(), password })
    });

    const text = await res.text();
    let data: any = null;
    try { data = text ? JSON.parse(text) : null; } catch {}

    if (!res.ok || !data?.ok) {
      throw new Error(data?.msg || `Login fehlgeschlagen (HTTP ${res.status})`);
    }

    this._user = data.user as User;
    try { sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._user)); } catch {}
  }

  logout(): void {
    this._user = null;
    try { sessionStorage.removeItem(this.STORAGE_KEY); } catch {}
  }

  /**
   * Eigenes Konto löschen (wie von account.ts erwartet).
   * Dein Backend akzeptiert DELETE /api/users/:username ohne Passwortprüfung.
   * Wir schicken das Passwort trotzdem mit – falls du später serverseitig prüfst.
   */
  async deleteOwnAccount(password: string): Promise<void> {
    if (!this._user?.username) {
      throw new Error('Kein eingeloggter Benutzer.');
    }

    const res = await fetch(`/api/users/${encodeURIComponent(this._user.username)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    const text = await res.text();
    let data: any = null;
    try { data = text ? JSON.parse(text) : null; } catch {}

    if (!res.ok || !data?.ok) {
      throw new Error(data?.msg || `Löschen fehlgeschlagen (HTTP ${res.status})`);
    }

    // Nach erfolgreichem Löschen direkt ausloggen
    this.logout();
  }
}
