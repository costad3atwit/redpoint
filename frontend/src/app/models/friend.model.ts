import { Session } from './session.model';

export interface Friend {
  friendId: string;
  friendUsername: string;
  profileIcon?: string;
}

export interface IncomingFriendRequest {
  requestId: string;
  senderId: string;
  senderUsername: string;
  senderProfileIcon?: string;
  status: string;
  createdAt: string;
}

export type FriendshipStatus = 'friend' | 'pending' | 'not_friend';

export interface UserSearchResult {
  friendId: string;
  friendUsername: string;
  profileIcon?: string;
  status: FriendshipStatus;
}

export interface FeedItem extends Session {
  friendId: string;
  friendUsername: string;
  friendProfileIcon?: string;
}

export interface FeedPage {
  items: FeedItem[];
  nextCursor: string | null;
}
