export interface Route {
  id: string;
  userId: string;
  name?: string;
  description?: string;
  grade: string;
  style?: string;
  environment?: string;
  holdType?: string[];
  wallStyle?: string;
  lastRouteLength?: number;
}

export interface RouteAttempt {
  id: string;
  sessionId: string;
  routeId: string;
  route: Route;
  sent: boolean;
  sendType?: string;
  attempts?: number;
  routeLength?: number;
  notes?: string;
}

export interface Session {
  id: string;
  userId: string;
  date: string;
  durationMinutes: number;
  rpe: number;
  fingerLoadRating: number;
  notes?: string;
  routeAttempts: RouteAttempt[];
}

export interface CreateSessionPayload {
  date?: string;
  duration_minutes: number;
  rpe: number;
  finger_load_rating: number;
  notes?: string;
}

export interface CreateRoutePayload {
  name?: string;
  description?: string;
  grade: string;
  style?: string;
  environment?: string;
  hold_type?: string[];
  wall_style?: string;
}

export interface CreateAttemptPayload {
  route_id: string;
  sent: boolean;
  send_type?: string;
  attempts?: number;
  route_length?: number;
  notes?: string;
}
