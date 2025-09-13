import { Component, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnDestroy {
  now = new Date();
  private t = setInterval(() => (this.now = new Date()), 1000);

  constructor(private router: Router) {}

  // Login-Seite? → volle Farbe, keine Ente
  get onLogin(): boolean {
    return this.router.url.startsWith('/login');
  }

  get time(): string {
    const hh = this.now.getHours().toString().padStart(2, '0');
    const mm = this.now.getMinutes().toString().padStart(2, '0');
    return `${hh}:${mm}`;
  }

  ngOnDestroy() {
    clearInterval(this.t);
  }
}
