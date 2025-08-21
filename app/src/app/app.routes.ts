import { Routes } from '@angular/router';

// Wir laden die Standalone-Komponenten dynamisch, damit es keine Pfadprobleme gibt.
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'start',
    loadComponent: () =>
      import('./pages/start/start.component').then(m => m.StartComponent),
  },
  {
    path: 'quiz',
    loadComponent: () =>
      import('./pages/quiz/quiz.component').then(m => m.QuizComponent),
  },
  {
    path: 'result',
    loadComponent: () =>
      import('./pages/result/result.component').then(m => m.ResultComponent),
  },
  {
    path: 'credits', // Logout-Abspann
    loadComponent: () =>
      import('./pages/credits/credits.component').then(m => m.CreditsComponent),
  },

  // Standard-Weiterleitungen
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
