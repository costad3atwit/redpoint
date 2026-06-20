import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { AnalyticsService } from '../../core/services/analytics.service';
import { SessionService } from '../../core/services/session.service';
import { AcwrData, PlateauData, TrainingData } from '../../models/analytics.model';
import { Session } from '../../models/session.model';
import { AcwrCardComponent } from './acwr-card/acwr-card.component';
import { PlateauCardComponent } from './plateau-card/plateau-card.component';
import { TrainingCardComponent } from './training-card/training-card.component';

interface AnalyticsPageData {
  acwr: AcwrData;
  plateau: PlateauData;
  training: TrainingData;
  sessions: Session[];
}

@Component({
  selector: 'rp-analytics',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    AcwrCardComponent,
    PlateauCardComponent,
    TrainingCardComponent,
  ],
  template: `
    <div class="analytics-page">
      <div class="page-header">
        <h1 class="page-title">Analytics</h1>
        <p class="page-sub">Insights from your climbing history</p>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <mat-spinner diameter="48" />
        </div>
      } @else if (error()) {
        <div class="error-state">
          <p>{{ error() }}</p>
        </div>
      } @else if (data()) {
        <div class="cards-grid">
          <rp-acwr-card [data]="data()!.acwr" />
          <rp-plateau-card [plateauData]="data()!.plateau" [sessions]="data()!.sessions" />
          <rp-training-card [data]="data()!.training" />
        </div>
      }
    </div>
  `,
  styles: [`
    .analytics-page {
      padding: 24px;
      max-width: 1100px;
      margin: 0 auto;
    }
    .page-header { margin-bottom: 28px; }
    .page-title {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 2rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--rp-text-primary);
      margin: 0 0 4px;
    }
    .page-sub {
      color: var(--rp-text-muted);
      font-size: 0.875rem;
      margin: 0;
    }

    .loading-state {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 300px;
    }

    .error-state {
      padding: 24px;
      color: var(--rp-accent);
      text-align: center;
    }

    .cards-grid {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
  `],
})
export class AnalyticsComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private sessionService = inject(SessionService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly data = signal<AnalyticsPageData | null>(null);

  ngOnInit(): void {
    forkJoin({
      acwr: this.analyticsService.getAcwr(),
      plateau: this.analyticsService.getPlateau(),
      training: this.analyticsService.getTraining(),
      sessions: this.sessionService.getSessions(),
    }).subscribe({
      next: result => {
        this.data.set(result);
        this.loading.set(false);
      },
      error: err => {
        this.error.set('Failed to load analytics. Please try again.');
        this.loading.set(false);
      },
    });
  }
}
