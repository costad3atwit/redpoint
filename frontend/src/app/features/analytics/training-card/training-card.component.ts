import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { TrainingData } from '../../../models/analytics.model';

interface CategoryChart {
  label: string;
  chartData: ChartData<'bar'>;
  height: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  hold_type: 'Hold Type',
  style: 'Climbing Style',
  wall_style: 'Wall Style',
  environment: 'Environment',
  send_type: 'Send Type',
};

@Component({
  selector: 'rp-training-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, BaseChartDirective],
  template: `
    <mat-card class="analytics-card">
      <mat-card-header>
        <mat-card-title>Training Recommender</mat-card-title>
        <mat-card-subtitle>Based on your last 10 climbs</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <div class="recommendation-banner">
          <span class="rec-label">Focus on</span>
          <span class="rec-value">{{ data.reccomendedTraining }}</span>
        </div>
        <p class="rec-text">{{ data.recommendation }}</p>

        <div class="charts-grid">
          @for (cat of categoryCharts; track cat.label) {
            <div class="category-chart">
              <h4 class="cat-title">{{ cat.label }}</h4>
              <div [style.height.px]="cat.height">
                <canvas baseChart
                  [data]="cat.chartData"
                  [options]="chartOptions"
                  type="bar">
                </canvas>
              </div>
            </div>
          }
        </div>
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

    .recommendation-banner {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 20px 0 8px;
      padding: 12px 16px;
      background: rgba(192, 57, 43, 0.1);
      border: 1px solid rgba(192, 57, 43, 0.3);
      border-radius: 8px;
    }
    .rec-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--rp-text-muted);
    }
    .rec-value {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--rp-accent);
      text-transform: capitalize;
    }
    .rec-text {
      color: var(--rp-text-muted);
      font-size: 0.875rem;
      margin: 0 0 24px;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    @media (max-width: 700px) {
      .charts-grid { grid-template-columns: 1fr; }
    }
    .category-chart { display: flex; flex-direction: column; }
    .cat-title {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--rp-text-muted);
      margin: 0 0 8px;
      font-weight: 500;
    }
  `],
})
export class TrainingCardComponent implements OnChanges {
  @Input({ required: true }) data!: TrainingData;

  categoryCharts: CategoryChart[] = [];

  readonly chartOptions: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        ticks: { color: 'rgba(240,236,228,0.5)', font: { size: 11 } },
        grid: { color: 'rgba(255,255,255,0.06)' },
        beginAtZero: true,
      },
      y: {
        ticks: { color: 'rgba(240,236,228,0.7)', font: { size: 11 } },
        grid: { display: false },
      },
    },
  };

  ngOnChanges(): void {
    this.categoryCharts = this.buildCharts();
  }

  private buildCharts(): CategoryChart[] {
    const cats = this.data.categoryCounts;
    return Object.entries(cats).map(([key, counts]) => {
      const recommended = this.data.recommendations[key] ?? '';
      const labels = Object.keys(counts);
      const values: number[] = Object.values(counts as Record<string, number>);
      const backgroundColors = labels.map(l =>
        l === recommended ? 'rgba(192, 57, 43, 0.85)' : 'rgba(240, 236, 228, 0.15)'
      );
      return {
        label: CATEGORY_LABELS[key] ?? key,
        height: Math.max(labels.length * 36 + 20, 80),
        chartData: {
          labels,
          datasets: [{
            data: values,
            backgroundColor: backgroundColors,
            borderColor: backgroundColors.map(c => c.replace('0.85', '1').replace('0.15', '0.3')),
            borderWidth: 1,
            borderRadius: 4,
          }],
        },
      };
    });
  }
}
