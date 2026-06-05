import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/auth/auth.service';
import { UserService } from '../../core/services/user.service';
import { UserProfile, UserStats } from '../../models/user.model';
import { ChangeEmailDialogComponent } from './change-email-dialog.component';
import { ChangePasswordDialogComponent } from './change-password-dialog.component';
import { DeleteAccountDialogComponent } from './delete-account-dialog.component';

@Component({
  selector: 'rp-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  imports: [DatePipe, MatCardModule, MatButtonModule, MatIconModule, MatDividerModule],
})
export class ProfileComponent implements OnInit {
  private auth = inject(AuthService);
  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  readonly profile = signal<UserProfile | null>(null);
  readonly stats = signal<UserStats | null>(null);

  readonly displayName = computed(() => {
    const user = this.auth.currentUser();
    if (user?.username) return user.username;
    const email = this.profile()?.email;
    return email ? email.split('@')[0] : `User #${user?.sub}`;
  });

  ngOnInit(): void {
    this.userService.getProfile().subscribe(p => this.profile.set(p));
    this.userService.getStats().subscribe(s => this.stats.set(s));
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
