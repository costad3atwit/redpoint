import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserProfile, UserStats } from '../../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  getProfile(): Observable<UserProfile> {
    return this.http.get<any>(`${this.api}/users/me`).pipe(map(r => this.mapProfile(r)));
  }

  getStats(): Observable<UserStats> {
    return this.http.get<any>(`${this.api}/users/me/stats`).pipe(
      map(r => ({
        totalSessions: r.total_sessions,
        totalRoutesSent: r.total_routes_sent,
        topBoulderGrade: r.top_boulder_grade,
        topRopedGrade: r.top_roped_grade,
      }))
    );
  }

  updateEmail(newEmail: string, currentPassword: string): Observable<UserProfile> {
    return this.http
      .patch<any>(`${this.api}/users/me/email`, { email: newEmail, current_password: currentPassword })
      .pipe(map(r => ({ id: r.id, email: r.email, username: r.username, createdAt: r.created_at })));
  }

  updatePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.patch<void>(`${this.api}/users/me/password`, {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  deleteAccount(): Observable<void> {
    return this.http.delete<void>(`${this.api}/users/me`);
  }
}