export interface AcwrResult {
  ratio: number;
  acuteLoad: number;
  chronicLoad: number;
  status: 'Undertraining' | 'Optimal' | 'Caution' | 'Overtraining Risk';
}

export interface AcwrWeek {
  weekStart: string;
  ratio: number;
}

export interface PlateauResult {
  detected: boolean;
  grade?: string;
  sessionsSpan?: number;
}

export interface SessionGradeRow {
  date: string;
  avgGrade: number;
  delta: number;
}

export interface TrainingFocusResult {
  recommendation: string;
  secondary: string;
  mostLogged: string;
}

export interface StyleFrequency {
  tag: string;
  count: number;
}
