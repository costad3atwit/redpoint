import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Route, CreateRoutePayload } from '../../models/session.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RouteService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  getRoutes(): Observable<Route[]> {
    return this.http
      .get<any[]>(`${this.api}/routes/`)
      .pipe(map(list => list.map(r => this.mapRoute(r))));
  }

  createRoute(payload: CreateRoutePayload): Observable<Route> {
    return this.http
      .post<any>(`${this.api}/routes/`, payload)
      .pipe(map(r => this.mapRoute(r)));
  }

  mapRoute(r: any): Route {
    return {
      id: r.id,
      userId: r.user_id,
      name: r.name,
      description: r.description,
      grade: r.grade,
      wallAngle: r.wall_angle,
      styleTags: r.style_tags,
    };
  }
}
