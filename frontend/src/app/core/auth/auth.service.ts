import { Injectable } from '@angular/core';
import { Observable, of, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { JwtPayload } from '../../models/user.model';

const TOKEN_KEY = 'rp_token';

function toBase64Url(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function buildMockToken(username: string, sub: string): string {
  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const exp = Math.floor(Date.now() / 1000) + 36 * 60 * 60;
  const payload = toBase64Url(JSON.stringify({ sub, username, exp }));
  return `${header}.${payload}.mock_signature`;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // TODO: replace with HttpClient call to POST /auth/login
  login(email: string, _password: string): Observable<{ token: string }> {
    return timer(300).pipe(
      switchMap(() => of({ token: buildMockToken('athlete', 'user-001') }))
    );
  }

  // TODO: replace with HttpClient call to POST /auth/register
  register(username: string, _email: string, _password: string): Observable<{ token: string }> {
    return timer(300).pipe(
      switchMap(() => of({ token: buildMockToken(username, 'user-001') }))
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;
    const payload = this.decodePayload(token);
    return payload !== null && payload.exp > Math.floor(Date.now() / 1000);
  }

  currentUser(): JwtPayload | null {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? this.decodePayload(token) : null;
  }

  storeToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  private decodePayload(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
      return JSON.parse(atob(padded)) as JwtPayload;
    } catch {
      return null;
    }
  }
}
