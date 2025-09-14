// src/app/app.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// WICHTIG: Pfad zu deinem Header-Component
// (liegt bei dir unter: src/app/shared_header/header/header.ts)
import { Header } from './shared_header/header/header';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [
    RouterOutlet,
    Header, // <app-header> wird dadurch bekannt
  ],
})
export class App {}
