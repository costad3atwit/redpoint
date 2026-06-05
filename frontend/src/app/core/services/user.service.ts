import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { UserProfile, UserStats } from '../../models/user.model';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private auth = inject(AuthService);

  getProfile(): Observable<UserProfile> {
    // TODO: replace with HttpClient call to GET /users/me
    const sub = this.auth.currentUser()?.sub ?? '1';
    return of<UserProfile>({
      id: sub,
      email: 'athlete@example.com',
      createdAt: '2025-01-15T00:00:00Z',
    }).pipe(delay(300));
  }

  getStats(): Observable<UserStats> {
    // TODO: replace with HttpClient call to GET /analytics/stats (or derive from sessions)
    return of<UserStats>({
      totalSessions: 24,
      totalRoutesSent: 47,
      topGradeSent: 'V6',
    }).pipe(delay(300));
  }

  updateEmail(newEmail: string, _currentPassword: string): Observable<UserProfile> {
    // TODO: replace with HttpClient call to PATCH /users/me
    const sub = this.auth.currentUser()?.sub ?? '1';
    return of<UserProfile>({ id: sub, email: newEmail, createdAt: '2025-01-15T00:00:00Z' }).pipe(
      delay(300)
    );
  }

  updatePassword(_currentPassword: string, _newPassword: string): Observable<void> {
    // TODO: replace with HttpClient call to PATCH /users/me
    return of(undefined).pipe(delay(300));
  }

  deleteAccount(): Observable<void> {
    // TODO: replace with HttpClient call to DELETE /users/me
    return of(undefined).pipe(delay(300));
  }
}
