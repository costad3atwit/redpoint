import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
import { JwtPayload } from '../../models/user.model';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'rp_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  login(email: string, password: string): Observable<{ token: string }> {
    // OAuth2PasswordRequestForm requires application/x-www-form-urlencoded
    const body = new URLSearchParams();
    body.set('username', email); // FastAPI OAuth2 form uses 'username' for the email field
    body.set('password', password);

    return this.http
      .post<{ access_token: string; token_type: string }>(`${this.api}/login`, body.toString(), {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }),
      })
      .pipe(map(res => ({ token: res.access_token })));
  }

  register(
    _username: string,
    email: string,
    password: string
  ): Observable<{ token: string }> {
    // TODO (Shayne): backend /register accepts {email, password} only — no username column yet
    return this.http
      .post<{ id: number; email: string; created_at: string }>(`${this.api}/register`, {
        email,
        password,
      })
      .pipe(
        // Register returns the user object, not a token — auto-login to get one
        switchMap(() => this.login(email, password))
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
