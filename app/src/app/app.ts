import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared_header/header/header'; // ← WICHTIG: Pfad mit shared_header/header/header

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
