export interface Session {
  id: string;
  userId: string;
  date: string; // ISO date
  gym: string;
  durationMinutes: number;
  rpe: number;
  load: number; // rpe * durationMinutes
  notes?: string;
  routes: Route[];
}

export interface Route {
  id: string;
  sessionId: string;
  grade: string;
  wallAngle: 'Slab' | 'Vertical' | 'Overhang' | 'Cave';
  styleTags: StyleTag[];
  attempts: number;
  sent: boolean;
  notes?: string;
}

export type StyleTag =
  | 'Crimps'
  | 'Slopers'
  | 'Pinches'
  | 'Pockets'
  | 'Compression'
  | 'Dynamic'
  | 'Balance';

export interface CreateSessionPayload {
  date: string;
  gym: string;
  durationMinutes: number;
  rpe: number;
  notes?: string;
  routes: Omit<Route, 'id' | 'sessionId'>[];
}
