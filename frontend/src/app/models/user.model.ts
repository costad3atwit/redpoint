export interface JwtPayload {
  sub: string;
  // TODO (Shayne): include `username: string` in the JWT payload so the UI can greet users by name
  username?: string;
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
