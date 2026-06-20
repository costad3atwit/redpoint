import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { PlateauData } from '../../../models/analytics.model';
import { Session } from '../../../models/session.model';
import { gradeToNumber, V_VALUES, YDS_VALUES } from '../../../core/utils/grade-utils';

type Discipline = 'boulder' | 'rope';

interface WeekBucket {
  label: string;
  grades: number[];
}

@Component({
  selector: 'rp-plateau-card',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonToggleModule,
    BaseChartDirective,
  ],
  template: `
    <mat-card class="analytics-card">
      <mat-card-content>
        <div class="card-header-row">
          <div class="card-titles">
            <span class="card-title">Grade Progression</span>
            <span class="card-subtitle">Weekly average send grade</span>
          </div>
          <mat-button-toggle-group [(ngModel)]="discipline" (ngModelChange)="onDisciplineChange()" class="discipline-toggle">
            <mat-button-toggle value="boulder">Boulder</mat-button-toggle>
            <mat-button-toggle value="rope">Rope</mat-button-toggle>
          </mat-button-toggle-group>
        </div>

        <div class="plateau-status-row">
          <div class="status-left">
            <span class="status-badge"
              [class.plateau]="badgeState === 'plateau'"
              [class.improving]="badgeState === 'improving'"
              [class.insufficient]="badgeState === 'insufficient'"
            >{{ badgeLabel }}</span>
            <span class="status-message">{{ statusMessage }}</span>
          </div>
          <mat-form-field appearance="outline" class="weeks-select">
            <mat-label>Time range</mat-label>
            <mat-select [(ngModel)]="selectedWeeks" (ngModelChange)="onWeeksChange()">
              <mat-option [value]="4">4 weeks</mat-option>
              <mat-option [value]="8">8 weeks</mat-option>
              <mat-option [value]="12">12 weeks</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        @if (hasData) {
          <div class="chart-container">
            <canvas baseChart
              [data]="chartData"
              [options]="chartOptions"
              type="bar">
            </canvas>
          </div>
        } @else {
          <div class="empty-chart">
            <p>No {{ discipline }} sends recorded in the last {{ selectedWeeks }} weeks.</p>
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

    .card-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 12px;
    }
    .card-titles { display: flex; flex-direction: column; gap: 2px; }
    .card-title {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 1.25rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--rp-text-primary);
    }
    .card-subtitle { font-size: 0.8rem; color: var(--rp-text-muted); }

    .plateau-status-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 12px;
    }
    .status-left {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      min-width: 0;
      padding-top: 8px;
    }
    .status-badge {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      padding: 3px 10px;
      border-radius: 999px;
      white-space: nowrap;
    }
    .status-badge.plateau {
      background: rgba(192, 57, 43, 0.12);
      border: 1px solid var(--rp-accent);
      color: var(--rp-accent);
    }
    .status-badge.improving {
      background: rgba(39, 174, 96, 0.12);
      border: 1px solid var(--rp-status-optimal);
      color: var(--rp-status-optimal);
    }
    .status-badge.insufficient {
      background: rgba(230, 126, 34, 0.12);
      border: 1px solid var(--rp-status-caution);
      color: var(--rp-status-caution);
    }
    .status-message { font-size: 0.875rem; color: var(--rp-text-muted); }

    .discipline-toggle {
      --mat-standard-button-toggle-height: 32px;
      flex-shrink: 0;
    }
    ::ng-deep .discipline-toggle .mat-button-toggle {
      background: var(--rp-surface-elevated);
      color: var(--rp-text-muted);
      border-color: var(--rp-border);
    }
    ::ng-deep .discipline-toggle .mat-button-toggle-checked {
      background: rgba(192, 57, 43, 0.2);
      color: var(--rp-text-primary);
    }

    .weeks-select {
      width: 150px;
      --mat-form-field-container-height: 36px;
      flex-shrink: 0;
    }
    ::ng-deep .weeks-select .mat-mdc-text-field-wrapper { background: var(--rp-surface-elevated); }

    .chart-container { height: 260px; position: relative; }

    .empty-chart {
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--rp-text-muted);
      font-size: 0.875rem;
      border: 1px dashed var(--rp-border);
      border-radius: 8px;
    }
  `],
})
export class PlateauCardComponent implements OnChanges {
  @Input({ required: true }) plateauData!: PlateauData;
  @Input({ required: true }) sessions!: Session[];

  discipline: Discipline = 'boulder';
  selectedWeeks = 8;
  chartData!: ChartData<'bar'>;
  chartOptions!: ChartOptions<'bar'>;
  hasData = false;

  get badgeState(): 'plateau' | 'improving' | 'insufficient' {
    const insufficientData = this.discipline === 'boulder'
      ? this.plateauData.boulderInsufficientData
      : this.plateauData.ropeInsufficientData;
    // Fields not yet provided by the backend fall back to "insufficient" rather than
    // silently reading as "improving".
    if (insufficientData ?? true) return 'insufficient';

    const plateauDetected = this.discipline === 'boulder'
      ? this.plateauData.boulderPlateauDetected
      : this.plateauData.ropePlateauDetected;
    return plateauDetected ? 'plateau' : 'improving';
  }

  get badgeLabel(): string {
    switch (this.badgeState) {
      case 'plateau': return 'Plateau Detected';
      case 'improving': return 'Improving';
      case 'insufficient': return 'Insufficient Data';
    }
  }

  get statusMessage(): string {
    const message = this.discipline === 'boulder'
      ? this.plateauData.boulderMessage
      : this.plateauData.ropeMessage;
    return message ?? 'Not enough data to determine plateau yet. Keep climbing!';
  }

  private buildChartOptions(yMax: number): ChartOptions<'bar'> {
    const gradeScale = this.discipline === 'boulder' ? V_VALUES : YDS_VALUES;
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const val = ctx.parsed.y;
              if (val == null) return '';
              return ` ${gradeScale[Math.round(val)] ?? val}`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: { color: 'rgba(240,236,228,0.5)', font: { size: 11 } },
          grid: { color: 'rgba(255,255,255,0.05)' },
        },
        y: {
          min: 0,
          max: yMax,
          ticks: {
            color: 'rgba(240,236,228,0.5)',
            font: { size: 11 },
            stepSize: 1,
            callback: (value) => {
              const n = Number(value);
              if (!Number.isInteger(n)) return '';
              return gradeScale[n] ?? n;
            },
          },
          grid: { color: 'rgba(255,255,255,0.05)' },
        },
      },
    };
  }

  ngOnChanges(): void {
    this.rebuildChart();
  }

  onDisciplineChange(): void {
    this.rebuildChart();
  }

  onWeeksChange(): void {
    this.rebuildChart();
  }

  private rebuildChart(): void {
    if (!this.sessions) return;
    const gradeScale = this.discipline === 'boulder' ? V_VALUES : YDS_VALUES;
    const buckets = this.buildWeekBuckets(this.selectedWeeks);
    const labels = buckets.map(b => b.label);
    const averages = buckets.map(b => b.grades.length ? Math.round(avg(b.grades)) : null);

    this.hasData = averages.some(v => v != null);

    const allGrades = buckets.flatMap(b => b.grades);
    const userMax = allGrades.length ? Math.max(...allGrades) : 0;
    const yMax = Math.min(userMax + 2, gradeScale.length - 1);

    const color = this.discipline === 'boulder'
      ? { bg: 'rgba(192, 57, 43, 0.75)', border: 'rgba(192, 57, 43, 1)' }
      : { bg: 'rgba(39, 174, 96, 0.65)', border: 'rgba(39, 174, 96, 1)' };

    this.chartData = {
      labels,
      datasets: [{
        label: this.discipline === 'boulder' ? 'Boulder' : 'Rope',
        data: averages as number[],
        backgroundColor: color.bg,
        borderColor: color.border,
        borderWidth: 1,
        borderRadius: 4,
      }],
    };

    this.chartOptions = this.buildChartOptions(yMax);
  }

  private buildWeekBuckets(weeks: number): WeekBucket[] {
    const now = new Date();
    const buckets: WeekBucket[] = [];

    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - i * 7 - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const label = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const grades: number[] = [];

      for (const session of this.sessions) {
        const sessionDate = new Date(session.date);
        if (sessionDate >= weekStart && sessionDate < weekEnd) {
          for (const attempt of session.routeAttempts) {
            if (!attempt.sent || !attempt.route?.grade) continue;
            const isBoulder = attempt.route.grade.toUpperCase().startsWith('V');
            if (this.discipline === 'boulder' && !isBoulder) continue;
            if (this.discipline === 'rope' && isBoulder) continue;
            const n = gradeToNumber(attempt.route.grade);
            if (n != null) grades.push(n);
          }
        }
      }

      buckets.push({ label, grades });
    }

    return buckets;
  }
}

function avg(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}
