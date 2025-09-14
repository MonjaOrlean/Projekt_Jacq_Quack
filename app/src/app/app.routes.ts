// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then(m => m.LoginComponent), // hier heißt die Klasse LoginComponent
  },
  {
    path: 'start',
    loadComponent: () =>
      import('./pages/start/start').then(m => m.Start),           // NICHT StartComponent
  },
  {
    path: 'quiz',
    loadComponent: () =>
      import('./pages/quiz/quiz').then(m => m.Quiz),              // NICHT QuizComponent
  },
  {
    path: 'result',
    loadComponent: () =>
      import('./pages/result/result').then(m => m.Result),        // NICHT ResultComponent
  },
  {
    path: 'credits',
    loadComponent: () =>
      import('./pages/credits/credits').then(m => m.Credits),     // NICHT CreditsComponent
  },

  // Redirects
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
