import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../core/auth/auth.service';
import { UserService } from '../../core/services/user.service';
import { RouteService } from '../../core/services/route.service';
import { UserProfile } from '../../models/user.model';
import { Route } from '../../models/session.model';
import { ChangeEmailDialogComponent } from './change-email-dialog.component';
import { ChangePasswordDialogComponent } from './change-password-dialog.component';
import { DeleteAccountDialogComponent } from './delete-account-dialog.component';

type EditingField = 'bio' | 'home-gym' | 'favorited-route' | null;

@Component({
  selector: 'rp-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  imports: [
    DatePipe,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
  ],
})
export class ProfileComponent implements OnInit {
  private auth = inject(AuthService);
  private userService = inject(UserService);
  private routeService = inject(RouteService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  readonly profile = signal<UserProfile | null>(null);
  readonly favoritedRoute = signal<Route | null>(null);

  readonly editingField = signal<EditingField>(null);
  readonly saving = signal(false);
  readonly bioInput = signal('');
  readonly homeGymInput = signal('');

  readonly routeLibrary = signal<Route[]>([]);
  readonly routeSearch = signal('');
  readonly pendingRoute = signal<Route | null>(null);
  readonly filteredRoutes = computed(() => {
    const q = this.routeSearch().toLowerCase();
    if (!q) return this.routeLibrary();
    return this.routeLibrary().filter(r =>
      (r.name ?? '').toLowerCase().includes(q) || r.grade.toLowerCase().includes(q)
    );
  });

  readonly displayName = computed(() => {
    const user = this.auth.currentUser();
    if (user?.username) return user.username;
    const email = this.profile()?.email;
    return email ? email.split('@')[0] : `User #${user?.user_id}`;
  });

  ngOnInit(): void {
    this.userService.getProfile().subscribe(p => {
      this.profile.set(p);
      if (p.favoritedRouteId) {
        this.routeService.getRoute(p.favoritedRouteId).subscribe({
          next: r => this.favoritedRoute.set(r),
        });
      }
    });
  }

  startEdit(field: 'bio' | 'home-gym', currentValue?: string): void {
    if (field === 'bio') this.bioInput.set(currentValue ?? '');
    if (field === 'home-gym') this.homeGymInput.set(currentValue ?? '');
    this.editingField.set(field);
  }

  startEditRoute(): void {
    this.pendingRoute.set(this.favoritedRoute());
    this.routeSearch.set('');
    if (this.routeLibrary().length === 0) {
      this.routeService.getRoutes().subscribe(routes => this.routeLibrary.set(routes));
    }
    this.editingField.set('favorited-route');
  }

  cancelEdit(): void {
    this.editingField.set(null);
    this.pendingRoute.set(null);
    this.routeSearch.set('');
  }

  saveBio(): void {
    const bio = this.bioInput().trim() || null;
    this.saving.set(true);
    this.userService.updateBio(bio).subscribe({
      next: p => {
        this.profile.set(p);
        this.editingField.set(null);
        this.saving.set(false);
        this.snackBar.open('Bio updated', 'Dismiss', { duration: 3000 });
      },
      error: () => {
        this.saving.set(false);
        this.snackBar.open('Failed to update bio', 'Dismiss', { duration: 4000 });
      },
    });
  }

  saveHomeGym(): void {
    const homeGym = this.homeGymInput().trim() || null;
    this.saving.set(true);
    this.userService.updateHomeGym(homeGym).subscribe({
      next: p => {
        this.profile.set(p);
        this.editingField.set(null);
        this.saving.set(false);
        this.snackBar.open('Home gym updated', 'Dismiss', { duration: 3000 });
      },
      error: () => {
        this.saving.set(false);
        this.snackBar.open('Failed to update home gym', 'Dismiss', { duration: 4000 });
      },
    });
  }

  saveFavoritedRoute(): void {
    const route = this.pendingRoute();
    if (!route) return;
    this.saving.set(true);
    this.userService.updateFavoritedRoute(route.id).subscribe({
      next: p => {
        this.profile.set(p);
        this.favoritedRoute.set(route);
        this.editingField.set(null);
        this.pendingRoute.set(null);
        this.saving.set(false);
        this.snackBar.open('Favorite route updated', 'Dismiss', { duration: 3000 });
      },
      error: () => {
        this.saving.set(false);
        this.snackBar.open('Failed to update favorite route', 'Dismiss', { duration: 4000 });
      },
    });
  }

  openChangeEmail(): void {
    this.dialog
      .open(ChangeEmailDialogComponent, { width: '400px' })
      .afterClosed()
      .subscribe(result => {
        if (!result) return;
        this.userService.updateEmail(result.email, result.password).subscribe({
          next: p => {
            this.profile.set(p);
            this.snackBar.open('Email updated', 'Dismiss', { duration: 3000 });
          },
          error: () =>
            this.snackBar.open('Failed to update email', 'Dismiss', { duration: 4000 }),
        });
      });
  }

  openChangePassword(): void {
    this.dialog
      .open(ChangePasswordDialogComponent, { width: '400px' })
      .afterClosed()
      .subscribe(result => {
        if (!result) return;
        this.userService.updatePassword(result.currentPassword, result.newPassword).subscribe({
          next: () => this.snackBar.open('Password updated', 'Dismiss', { duration: 3000 }),
          error: () =>
            this.snackBar.open('Failed to update password', 'Dismiss', { duration: 4000 }),
        });
      });
  }

  openDeleteAccount(): void {
    this.dialog
      .open(DeleteAccountDialogComponent, { width: '420px' })
      .afterClosed()
      .subscribe(confirmed => {
        if (!confirmed) return;
        this.userService.deleteAccount().subscribe({
          next: () => {
            this.auth.logout();
            this.router.navigate(['/login']);
          },
          error: () =>
            this.snackBar.open('Failed to delete account', 'Dismiss', { duration: 4000 }),
        });
      });
  }

  signOut(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
