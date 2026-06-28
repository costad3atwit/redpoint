import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { UserService } from '../../core/services/user.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { SessionService } from '../../core/services/session.service';
import { AcwrCardComponent } from '../analytics/acwr-card/acwr-card.component';
import { UserProfile, UserStats } from '../../models/user.model';
import { AcwrData } from '../../models/analytics.model';
import { Session } from '../../models/session.model';
import { gradeWithFont } from '../../core/utils/grade-utils';

interface DashboardData {
  profile: UserProfile;
  stats: UserStats;
  acwr: AcwrData;
  sessions: Session[];
}

@Component({
  selector: 'rp-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    AcwrCardComponent,
  ],
})
export class DashboardComponent implements OnInit {
  private auth = inject(AuthService);
  private userService = inject(UserService);
  private analyticsService = inject(AnalyticsService);
  private sessionService = inject(SessionService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly data = signal<DashboardData | null>(null);

  readonly displayName = computed(() => {
    const user = this.auth.currentUser();
    if (user?.username) return user.username;
    const email = this.data()?.profile.email;
    return email ? email.split('@')[0] : `User #${user?.user_id}`;
  });

  readonly topBoulderDisplay = computed(() =>
    gradeWithFont(this.data()?.stats.topBoulderGrade ?? '—')
  );
  readonly topRopedDisplay = computed(() =>
    gradeWithFont(this.data()?.stats.topRopedGrade ?? '—')
  );

  readonly recentSessions = computed(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    cutoff.setHours(0, 0, 0, 0);
    return (this.data()?.sessions ?? []).filter(s => new Date(s.date) >= cutoff);
  });

  readonly avgFingerLoad = computed(() => {
    const recent = this.recentSessions();
    if (recent.length === 0) return null;
    return recent.reduce((sum, s) => sum + s.fingerLoadRating, 0) / recent.length;
  });

  ngOnInit(): void {
    forkJoin({
      profile: this.userService.getProfile(),
      stats: this.userService.getStats(),
      acwr: this.analyticsService.getAcwr(),
      sessions: this.sessionService.getSessions(),
    }).subscribe({
      next: result => {
        this.data.set(result);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load dashboard. Please try again.');
        this.loading.set(false);
      },
    });
  }

  sentCount(session: Session): number {
    return session.routeAttempts.filter(a => a.sent).length;
  }
}
