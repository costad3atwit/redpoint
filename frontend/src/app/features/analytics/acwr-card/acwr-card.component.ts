import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { AcwrData } from '../../../models/analytics.model';

type AcwrStatus = 'Undertraining' | 'Optimal' | 'Caution' | 'Overtraining Risk';

@Component({
  selector: 'rp-acwr-card',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card class="analytics-card">
      <mat-card-header>
        <mat-card-title>Acute:Chronic Workload Ratio</mat-card-title>
        <mat-card-subtitle>Training load balance over the last 28 days</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        @if (data.insufficientData) {
          <div class="insufficient-data">
            <p>Not enough training history yet. ACWR needs at least 4 weeks of logged sessions to give an accurate ratio — keep logging!</p>
          </div>
        } @else {
          <div class="stats-row">
            <div class="stat-box">
              <span class="stat-label">Acute Load</span>
              <span class="stat-value">{{ data.acuteLoad | number:'1.0-0' }}</span>
              <span class="stat-sub">7-day avg</span>
            </div>
            <div class="stat-box divider">
              <span class="stat-label">Ratio</span>
              <span class="stat-value ratio" [class]="statusClass">{{ data.acwrRatio | number:'1.2-2' }}</span>
              <span class="status-badge" [class]="statusClass">{{ status }}</span>
            </div>
            <div class="stat-box">
              <span class="stat-label">Chronic Load</span>
              <span class="stat-value">{{ data.chronicLoad | number:'1.0-0' }}</span>
              <span class="stat-sub">28-day avg</span>
            </div>
          </div>

          <div class="gauge-container">
            <div class="gauge-track">
              <div class="zone zone-under" title="Undertraining (< 0.8)"></div>
              <div class="zone zone-optimal" title="Optimal (0.8 – 1.3)"></div>
              <div class="zone zone-caution" title="Caution (1.3 – 1.5)"></div>
              <div class="zone zone-over" title="Overtraining Risk (> 1.5)"></div>
              <div class="gauge-marker" [style.left]="markerLeft"></div>
            </div>
            <div class="gauge-labels">
              <span>0</span>
              <span>0.5</span>
              <span>1</span>
              <span>1.5</span>
              <span>2.0+</span>
            </div>
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .analytics-card {
      background: var(--rp-surface);
      border: 1px solid var(--rp-border);
      color: var(--rp-text-primary);
    }
    mat-card-title { font-family: 'Barlow Condensed', sans-serif; font-size: 1.25rem; letter-spacing: 0.05em; text-transform: uppercase; }
    mat-card-subtitle { color: var(--rp-text-muted); }

    .stats-row {
      display: flex;
      justify-content: space-around;
      align-items: center;
      margin: 24px 0 20px;
    }
    .stat-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .stat-box.divider {
      border-left: 1px solid var(--rp-border);
      border-right: 1px solid var(--rp-border);
      padding: 0 32px;
    }
    .stat-label { font-size: 0.75rem; color: var(--rp-text-muted); text-transform: uppercase; letter-spacing: 0.08em; }
    .stat-value { font-family: 'Barlow Condensed', sans-serif; font-size: 2rem; font-weight: 600; }
    .stat-value.ratio { font-size: 2.5rem; }
    .stat-sub { font-size: 0.7rem; color: var(--rp-text-muted); }

    .status-badge {
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      padding: 2px 8px;
      border-radius: 999px;
      margin-top: 2px;
    }

    .undertraining { color: var(--rp-status-undertraining); }
    .optimal { color: var(--rp-status-optimal); }
    .caution { color: var(--rp-status-caution); }
    .overtraining { color: var(--rp-accent); }

    .status-badge.undertraining { background: rgba(240, 236, 228, 0.08); border: 1px solid var(--rp-status-undertraining); }
    .status-badge.optimal { background: rgba(39, 174, 96, 0.12); border: 1px solid var(--rp-status-optimal); }
    .status-badge.caution { background: rgba(230, 126, 34, 0.12); border: 1px solid var(--rp-status-caution); }
    .status-badge.overtraining { background: rgba(192, 57, 43, 0.12); border: 1px solid var(--rp-accent); }

    .gauge-container { margin-top: 8px; }
    .gauge-track {
      position: relative;
      height: 10px;
      border-radius: 5px;
      overflow: visible;
      display: flex;
    }
    .zone { height: 100%; }
    .zone-under  { width: 40%; background: rgba(240, 236, 228, 0.15); border-radius: 5px 0 0 5px; }
    .zone-optimal { width: 25%; background: rgba(39, 174, 96, 0.4); }
    .zone-caution { width: 10%; background: rgba(230, 126, 34, 0.4); }
    .zone-over   { width: 25%; background: rgba(192, 57, 43, 0.35); border-radius: 0 5px 5px 0; }

    .gauge-marker {
      position: absolute;
      top: -3px;
      width: 4px;
      height: 16px;
      background: var(--rp-text-primary);
      border-radius: 2px;
      transform: translateX(-50%);
      transition: left 0.4s ease;
      box-shadow: 0 0 4px rgba(0,0,0,0.5);
    }
    .gauge-labels {
      display: flex;
      justify-content: space-between;
      margin-top: 6px;
      font-size: 0.65rem;
      color: var(--rp-text-muted);
    }

    .insufficient-data {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 160px;
      text-align: center;
      color: var(--rp-text-muted);
      font-size: 0.875rem;
      border: 1px dashed var(--rp-border);
      border-radius: 8px;
      padding: 16px;
    }
  `],
})
export class AcwrCardComponent {
  @Input({ required: true }) data!: AcwrData;

  get status(): AcwrStatus {
    const r = this.data.acwrRatio;
    if (r < 0.8) return 'Undertraining';
    if (r <= 1.3) return 'Optimal';
    if (r <= 1.5) return 'Caution';
    return 'Overtraining Risk';
  }

  get statusClass(): string {
    const s = this.status;
    if (s === 'Undertraining') return 'undertraining';
    if (s === 'Optimal') return 'optimal';
    if (s === 'Caution') return 'caution';
    return 'overtraining';
  }

  get markerLeft(): string {
    const clamped = Math.min(Math.max(this.data.acwrRatio, 0), 2);
    return `${(clamped / 2) * 100}%`;
  }
}
