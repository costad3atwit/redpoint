import { Component, OnInit, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SessionService } from '../../../core/services/session.service';
import { Session } from '../../../models/session.model';

@Component({
  selector: 'rp-session-detail',
  imports: [
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="detail-page">
      <header class="detail-header">
        <button mat-icon-button (click)="back()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h2>Session Detail</h2>
      </header>

      @if (loading()) {
        <div class="spinner-wrap"><mat-spinner diameter="40" /></div>
      } @else if (session()) {
        <mat-card class="info-card">
          <mat-card-content>
            <div class="info-row">
              <span class="label">Date</span>
              <span>{{ session()!.date | date:'EEEE, MMMM d, y' }}</span>
            </div>
            <mat-divider />
            <div class="info-row">
              <span class="label">Duration</span>
              <span>{{ session()!.durationMinutes }} min</span>
            </div>
            <mat-divider />
            <div class="stats-row">
              <div class="stat">
                <span class="stat-label">RPE</span>
                <span class="stat-value">{{ session()!.rpe }}/10</span>
              </div>
              <div class="stat">
                <span class="stat-label">Finger Load</span>
                <span class="stat-value">{{ session()!.fingerLoadRating }}/10</span>
              </div>
              <div class="stat">
                <span class="stat-label">Routes Logged</span>
                <span class="stat-value">{{ session()!.routeAttempts.length }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Sent</span>
                <span class="stat-value accent">{{ sentCount() }}</span>
              </div>
            </div>
            @if (session()!.notes) {
              <mat-divider />
              <div class="notes-section">
                <span class="label">Notes</span>
                <p class="notes-text">{{ session()!.notes }}</p>
              </div>
            }
          </mat-card-content>
        </mat-card>

        @if (session()!.routeAttempts.length > 0) {
          <h3 class="routes-heading">Routes ({{ session()!.routeAttempts.length }})</h3>
          @for (attempt of session()!.routeAttempts; track attempt.id) {
            <mat-card class="route-card">
              <mat-card-content>
                <div class="route-row">
                  <div class="route-identity">
                    <span class="route-grade">{{ attempt.route.grade }}</span>
                    @if (attempt.route.name) {
                      <span class="route-name">{{ attempt.route.name }}</span>
                    }
                  </div>
                  <div class="route-chips">
                    @if (attempt.route.wallStyle) {
                      <span class="chip">{{ attempt.route.wallStyle }}</span>
                    }
                    @if (attempt.sent) {
                      <span class="chip chip--sent">{{ attempt.sendType ?? 'Sent' }}</span>
                    } @else {
                      <span class="chip chip--attempt">Attempt</span>
                    }
                    @if (attempt.attempts && attempt.attempts > 1) {
                      <span class="chip">{{ attempt.attempts }}x</span>
                    }
                    @if (attempt.routeLength) {
                      <span class="chip">{{ attempt.routeLength }} moves</span>
                    }
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          }
        }
      }
    </div>
  `,
  styles: [`
    .detail-page { padding: 24px; max-width: 800px; margin: 0 auto; }
    .detail-header { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
    .spinner-wrap { display: flex; justify-content: center; padding: 48px; }
    .info-card { margin-bottom: 24px; }
    .info-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; }
    .label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--rp-text-muted); }
    .stats-row { display: flex; gap: 24px; padding: 12px 0; flex-wrap: wrap; }
    .stat { display: flex; flex-direction: column; }
    .stat-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--rp-text-muted); }
    .stat-value { font-size: 1.1rem; font-weight: 500; }
    .stat-value.accent { color: var(--rp-accent); }
    .notes-section { padding: 12px 0; }
    .notes-text { margin: 4px 0 0; color: var(--rp-text-muted); font-size: 0.9rem; line-height: 1.5; }
    .routes-heading { margin: 0 0 12px; }
    .route-card { margin-bottom: 8px; }
    .route-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
    .route-identity { display: flex; align-items: baseline; gap: 10px; }
    .route-grade {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 1.3rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .route-name { font-size: 0.9rem; color: var(--rp-text-muted); }
    .route-chips { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
    .chip { padding: 2px 8px; border-radius: 4px; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; background: var(--rp-surface-elevated); color: var(--rp-text-muted); }
    .chip--sent { background: rgba(39, 174, 96, 0.2); color: var(--rp-status-optimal); }
    .chip--attempt { background: rgba(240, 236, 228, 0.08); color: var(--rp-text-muted); }
  `],
})
export class SessionDetailComponent implements OnInit {
  private location = inject(Location);
  private route = inject(ActivatedRoute);
  private sessionService = inject(SessionService);
  private router = inject(Router);

  readonly session = signal<Session | null>(null);
  readonly loading = signal(true);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.sessionService.getSession(id).subscribe({
      next: s => { this.session.set(s); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  sentCount(): number {
    return this.session()?.routeAttempts.filter(a => a.sent).length ?? 0;
  }

  back(): void {
    this.location.back();
  }
}
