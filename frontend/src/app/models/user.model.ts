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
  bio?: string;
  homeGym?: string;
  favoritedRouteId?: string;
}

export interface UserStats {
  totalSessions: number;
  totalRoutesSent: number;
  topBoulderGrade: string;
  topRopedGrade: string;
}
