export interface JwtPayload {
  user_id: string;
  username: string;
  exp: number;
}

export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  createdAt: string; // ISO date string
}

export interface UserStats {
  totalSessions: number;
  totalRoutesSent: number;
  topGradeSent: string;
}
