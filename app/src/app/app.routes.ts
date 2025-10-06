import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register').then(m => m.RegisterComponent) },

  { path: 'start',  canMatch: [authGuard], loadComponent: () => import('./pages/start/start').then(m => m.StartComponent) },
  { path: 'quiz',   canMatch: [authGuard], loadComponent: () => import('./pages/quiz/quiz').then(m => m.QuizComponent) },
  { path: 'result', canMatch: [authGuard], loadComponent: () => import('./pages/result/result').then(m => m.ResultComponent) },
  { path: 'account',canMatch: [authGuard], loadComponent: () => import('./pages/account/account').then(m => m.AccountComponent) },
  { path: 'credits',loadComponent: () => import('./pages/credits/credits').then(m => m.CreditsComponent) },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
