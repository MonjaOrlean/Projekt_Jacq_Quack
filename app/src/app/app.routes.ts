import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Login: Du hast vorhin "LoginComponent" übernommen – das lassen wir so.
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then((m) => m.LoginComponent),
  },

  // Diese vier Seiten exportieren (bei dir) Klassen ohne "Component":
  {
    path: 'start',
    loadComponent: () =>
      import('./pages/start/start').then((m) => m.Start),
  },
  {
    path: 'quiz',
    loadComponent: () =>
      import('./pages/quiz/quiz').then((m) => m.Quiz),
  },
  {
    path: 'result',
    loadComponent: () =>
      import('./pages/result/result').then((m) => m.Result),
  },
  {
    path: 'credits',
    loadComponent: () =>
      import('./pages/credits/credits').then((m) => m.Credits),
  },

  // Fallback
  { path: '**', redirectTo: 'login' },
];
