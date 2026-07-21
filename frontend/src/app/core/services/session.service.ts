import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Session,
  RouteAttempt,
  CreateSessionPayload,
  CreateAttemptPayload,
} from '../../models/session.model';
import { RouteService } from './route.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private http = inject(HttpClient);
  private routeService = inject(RouteService);
  private api = environment.apiUrl;

  getSessions(): Observable<Session[]> {
    return this.http
      .get<any[]>(`${this.api}/sessions/`)
      .pipe(map(list => list.map(s => this.mapSession(s))));
  }

  getSession(id: string): Observable<Session> {
    return this.http
      .get<any>(`${this.api}/sessions/${id}`)
      .pipe(map(s => this.mapSession(s)));
  }

  createSession(payload: CreateSessionPayload): Observable<Session> {
    return this.http
      .post<any>(`${this.api}/sessions/`, payload)
      .pipe(map(s => this.mapSession(s)));
  }

  updateSession(id: string, payload: CreateSessionPayload): Observable<Session> {
    return this.http
      .put<any>(`${this.api}/sessions/${id}`, payload)
      .pipe(map(s => this.mapSession(s)));
  }

  deleteSession(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/sessions/${id}`);
  }

  createAttempt(sessionId: string, payload: CreateAttemptPayload): Observable<RouteAttempt> {
    return this.http
      .post<any>(`${this.api}/sessions/${sessionId}/attempts`, payload)
      .pipe(map(a => this.mapAttempt(a)));
  }

  deleteAttempt(attemptId: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/attempts/${attemptId}`);
  }

  mapSession(s: any): Session {
    return {
      id: s.id,
      userId: s.user_id,
      date: s.date,
      durationMinutes: s.duration_minutes,
      rpe: s.rpe,
      fingerLoadRating: s.finger_load_rating,
      notes: s.notes,
      routeAttempts: (s.route_attempts ?? []).map((a: any) => this.mapAttempt(a)),
    };
  }

  private mapAttempt(a: any): RouteAttempt {
    return {
      id: a.id,
      sessionId: a.session_id,
      routeId: a.route_id,
      route: this.routeService.mapRoute(a.route),
      sent: a.sent,
      sendType: a.send_type,
      attempts: a.attempts,
      routeLength: a.route_length,
      notes: a.notes,
    };
  }
}
