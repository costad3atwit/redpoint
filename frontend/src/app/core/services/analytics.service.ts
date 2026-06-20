import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AcwrData, PlateauData, TrainingData } from '../../models/analytics.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  getAcwr(): Observable<AcwrData> {
    return this.http.get<any>(`${this.api}/analytics/acwr`).pipe(
      map(r => ({
        acuteLoad: r.acute_load,
        chronicLoad: r.chronic_load,
        acwrRatio: r.acwr_ratio,
        overtrainingRisk: r.overtraining_risk,
      }))
    );
  }

  getPlateau(): Observable<PlateauData> {
    return this.http.get<any>(`${this.api}/analytics/plateau`).pipe(
      map(r => ({
        boulderPlateauDetected: r.boulder_plateau_detected,
        boulderRecentAverageGrade: r.boulder_recent_average_grade,
        boulderPreviousAverageGrade: r.boulder_previous_average_grade,
        boulderImprovement: r.boulder_improvement,
        boulderMessage: r.boulder_message,
        ropePlateauDetected: r.rope_plateau_detected,
        ropeRecentAverageGrade: r.rope_recent_average_grade,
        ropePreviousAverageGrade: r.rope_previous_average_grade,
        ropeImprovement: r.rope_improvement,
        ropeMessage: r.rope_message,
      }))
    );
  }

  getTraining(): Observable<TrainingData> {
    return this.http.get<any>(`${this.api}/analytics/training`).pipe(
      map(r => ({
        reccomendedTraining: r.reccomended_training,
        recommendations: r.recommendations,
        categoryCounts: r.category_counts,
        recommendation: r.recommendation,
      }))
    );
  }
}
