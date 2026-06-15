import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SessionService } from '../../../core/services/session.service';
import { Session } from '../../../models/session.model';

@Component({
  selector: 'rp-session-list',
  imports: [
    DatePipe,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="sessions-page">
      <header class="sessions-header">
        <h2>Sessions</h2>
        <a mat-flat-button routerLink="/sessions/new">
          <mat-icon>add</mat-icon>
          Log Session
        </a>
      </header>

      @if (loading()) {
        <div class="spinner-wrap">
          <mat-spinner diameter="40" />
        </div>
      } @else if (sessions().length === 0) {
        <div class="empty-state">
          <mat-icon>fitness_center</mat-icon>
          <p>No sessions yet. Log your first climb!</p>
        </div>
      } @else {
        <div class="session-cards">
          @for (session of sessions(); track session.id) {
            <mat-card class="session-card" [routerLink]="['/sessions', session.id]">
              <mat-card-content>
                <div class="card-main">
                  <span class="session-date">{{ session.date | date:'EEE, MMM d, y' }}</span>
                  <div class="card-actions">
                    <span class="session-duration">{{ session.durationMinutes }} min</span>
                    <a mat-icon-button [routerLink]="['/sessions', session.id, 'edit']" (click)="$event.stopPropagation()" aria-label="Edit session">
                      <mat-icon>edit</mat-icon>
                    </a>
                  </div>
                </div>
                <mat-divider />
                <div class="card-stats">
                  <div class="stat">
                    <span class="stat-label">RPE</span>
                    <span class="stat-value">{{ session.rpe }}/10</span>
                  </div>
                  <div class="stat">
                    <span class="stat-label">Finger Load</span>
                    <span class="stat-value">{{ session.fingerLoadRating }}/10</span>
                  </div>
                  <div class="stat">
                    <span class="stat-label">Logged</span>
                    <span class="stat-value">{{ session.routeAttempts.length }}</span>
                  </div>
                  <div class="stat">
                    <span class="stat-label">Sent</span>
                    <span class="stat-value accent">{{ sentCount(session) }}</span>
                  </div>
                </div>
                @if (session.notes) {
                  <p class="session-notes">{{ session.notes }}</p>
                }
              </mat-card-content>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .sessions-page { padding: 24px; max-width: 800px; margin: 0 auto; }

    .sessions-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }

    .spinner-wrap { display: flex; justify-content: center; padding: 48px; }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 64px 0;
      color: var(--rp-text-muted);
      text-align: center;
    }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; }

    .session-cards { display: flex; flex-direction: column; gap: 12px; }

    .session-card {
      cursor: pointer;
      transition: border-color 0.15s;
    }
    .session-card:hover { border-color: var(--rp-accent) !important; }

    .card-main {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .session-date {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 1.1rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .card-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .session-duration {
      font-size: 0.85rem;
      color: var(--rp-text-muted);
    }

    .card-stats {
      display: flex;
      gap: 24px;
      margin-top: 12px;
      flex-wrap: wrap;
    }

    .stat { display: flex; flex-direction: column; }

    .stat-label {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--rp-text-muted);
    }

    .stat-value { font-size: 1rem; font-weight: 500; }
    .stat-value.accent { color: var(--rp-accent); }

    .session-notes {
      margin-top: 12px;
      font-size: 0.85rem;
      color: var(--rp-text-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `],
})
export class SessionListComponent implements OnInit {
  private sessionService = inject(SessionService);

  readonly sessions = signal<Session[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.sessionService.getSessions().subscribe({
      next: sessions => {
        this.sessions.set(sessions);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  sentCount(session: Session): number {
    return session.routeAttempts.filter(a => a.sent).length;
  }
}
