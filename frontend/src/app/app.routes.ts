import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'sessions',
        loadComponent: () =>
          import('./features/sessions/session-list/session-list.component').then(
            m => m.SessionListComponent
          ),
      },
      {
        path: 'sessions/new',
        loadComponent: () =>
          import('./features/sessions/session-form/session-form.component').then(
            m => m.SessionFormComponent
          ),
      },
      {
        path: 'sessions/:id/edit',
        loadComponent: () =>
          import('./features/sessions/session-form/session-form.component').then(
            m => m.SessionFormComponent
          ),
      },
      {
        path: 'sessions/:id',
        loadComponent: () =>
          import('./features/sessions/session-detail/session-detail.component').then(
            m => m.SessionDetailComponent
          ),
      },
      {
        path: 'feed',
        loadComponent: () =>
          import('./features/friends/friend-feed/friend-feed.component').then(
            m => m.FriendFeedComponent
          ),
      },
      {
        path: 'friends',
        loadComponent: () =>
          import('./features/friends/friend-manage/friend-manage.component').then(
            m => m.FriendManageComponent
          ),
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./features/analytics/analytics.component').then(m => m.AnalyticsComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then(m => m.ProfileComponent),
      },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];
