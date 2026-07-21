import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Friend,
  IncomingFriendRequest,
  UserSearchResult,
  FeedItem,
  FeedPage,
} from '../../models/friend.model';
import { SessionService } from './session.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FriendService {
  private http = inject(HttpClient);
  private sessionService = inject(SessionService);
  private api = environment.apiUrl;

  getFeed(cursor?: string, limit = 10): Observable<FeedPage> {
    let params = new HttpParams().set('limit', limit);
    if (cursor) params = params.set('cursor', cursor);
    return this.http.get<any>(`${this.api}/friends/feed`, { params }).pipe(
      map(page => ({
        items: page.items.map((item: any) => this.mapFeedItem(item)),
        nextCursor: page.next_cursor,
      }))
    );
  }

  getFriends(): Observable<Friend[]> {
    return this.http.get<any[]>(`${this.api}/friends/`).pipe(
      map(list =>
        list.map(f => ({
          friendId: f.friend_id,
          friendUsername: f.friend_username,
          profileIcon: f.profile_icon ?? undefined,
        }))
      )
    );
  }

  getRequests(): Observable<IncomingFriendRequest[]> {
    return this.http.get<any[]>(`${this.api}/friends/requests`).pipe(
      map(list =>
        list.map(r => ({
          requestId: r.request_id,
          senderId: r.sender_id,
          senderUsername: r.sender_username,
          senderProfileIcon: r.sender_profile_icon ?? undefined,
          status: r.status,
          createdAt: r.created_at,
        }))
      )
    );
  }

  sendRequest(username: string): Observable<void> {
    return this.http.post<void>(`${this.api}/friends/request`, { username });
  }

  acceptRequest(requestId: string): Observable<void> {
    return this.http.post<void>(`${this.api}/friends/accept/${requestId}`, {});
  }

  declineRequest(requestId: string): Observable<void> {
    return this.http.post<void>(`${this.api}/friends/decline/${requestId}`, {});
  }

  removeFriend(friendId: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/friends/${friendId}`);
  }

  searchUsers(query: string): Observable<UserSearchResult[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<any[]>(`${this.api}/friends/search`, { params }).pipe(
      map(list =>
        list.map(u => ({
          friendId: u.friend_id,
          friendUsername: u.friend_username,
          profileIcon: u.profile_icon ?? undefined,
          status: u.status,
        }))
      )
    );
  }

  private mapFeedItem(item: any): FeedItem {
    return {
      ...this.sessionService.mapSession(item),
      friendId: item.friend_id,
      friendUsername: item.friend_username,
      friendProfileIcon: item.friend_profile_icon ?? undefined,
    };
  }
}
