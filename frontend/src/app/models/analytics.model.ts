export interface AcwrData {
  acuteLoad: number;
  chronicLoad: number;
  acwrRatio: number;
  overtrainingRisk: boolean;
}

export interface PlateauData {
  boulderPlateauDetected: boolean;
  boulderRecentAverageGrade: number;
  boulderPreviousAverageGrade: number;
  boulderImprovement: number;
  boulderMessage: string;
  ropePlateauDetected: boolean;
  ropeRecentAverageGrade: number;
  ropePreviousAverageGrade: number;
  ropeImprovement: number;
  ropeMessage: string;
}

export interface CategoryCounts {
  hold_type: Record<string, number>;
  style: Record<string, number>;
  wall_style: Record<string, number>;
  environment: Record<string, number>;
  send_type: Record<string, number>;
}

export interface TrainingData {
  reccomendedTraining: string;
  recommendations: Record<string, string>;
  categoryCounts: CategoryCounts;
  recommendation: string;
}
