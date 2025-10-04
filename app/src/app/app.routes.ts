import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then(m => m.LoginComponent),
  },
  {
    path: 'start',
    loadComponent: () =>
      import('./pages/start/start').then(m => m.StartComponent),
  },
  {
    path: 'quiz',
    loadComponent: () =>
      import('./pages/quiz/quiz').then(m => m.QuizComponent),
  },
  {
    path: 'result',
    loadComponent: () =>
      import('./pages/result/result').then(m => m.ResultComponent),
  },
  {
    path: 'credits',
    loadComponent: () =>
      import('./pages/credits/credits').then(m => m.CreditsComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register').then(m => m.RegisterComponent),
  },

  // Standard-Weiterleitungen
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
