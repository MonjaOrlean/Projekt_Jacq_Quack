import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then(m => m.Login),
  },
  {
    path: 'start',
    loadComponent: () =>
      import('./pages/start/start').then(m => m.Start),
  },
  {
    path: 'quiz',
    loadComponent: () =>
      import('./pages/quiz/quiz').then(m => m.Quiz),
  },
  {
    path: 'result',
    loadComponent: () =>
      import('./pages/result/result').then(m => m.Result),
  },
  {
    path: 'credits',
    loadComponent: () =>
      import('./pages/credits/credits').then(m => m.Credits),
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
