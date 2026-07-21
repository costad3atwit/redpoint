import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { FriendService } from '../../../core/services/friend.service';
import { extractErrorMessage } from '../../../core/utils/http-error';
import { avatarColor } from '../../../core/utils/avatar-utils';
import { isCustomIcon } from '../../profile/profile-icons';
import {
  Friend,
  IncomingFriendRequest,
  UserSearchResult,
} from '../../../models/friend.model';

@Component({
  selector: 'rp-friend-manage',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './friend-manage.component.html',
  styleUrl: './friend-manage.component.scss',
})
export class FriendManageComponent implements OnInit {
  private friendService = inject(FriendService);
  private snackBar = inject(MatSnackBar);

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly avatarColor = avatarColor;
  readonly isCustomIcon = isCustomIcon;

  readonly friends = signal<Friend[]>([]);
  readonly requests = signal<IncomingFriendRequest[]>([]);
  readonly loadingFriends = signal(true);

  // Usernames whose request was just sent, so results flip to "Pending"
  // without re-querying.
  private readonly justRequested = signal<Set<string>>(new Set());

  readonly searchResults = toSignal(
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query =>
        query.trim() ? this.friendService.searchUsers(query.trim()) : of<UserSearchResult[]>([])
      )
    ),
    { initialValue: [] as UserSearchResult[] }
  );

  ngOnInit(): void {
    this.loadFriends();
    this.loadRequests();
  }

  statusOf(result: UserSearchResult): string {
    if (result.status === 'not_friend' && this.justRequested().has(result.friendUsername)) {
      return 'pending';
    }
    return result.status;
  }

  addFriend(result: UserSearchResult): void {
    this.friendService.sendRequest(result.friendUsername).subscribe({
      next: () => {
        this.justRequested.update(set => new Set(set).add(result.friendUsername));
        this.snackBar.open(`Friend request sent to ${result.friendUsername}`, 'Dismiss', {
          duration: 3000,
        });
      },
      error: err => {
        this.snackBar.open(
          extractErrorMessage(err, 'Failed to send friend request'),
          'Dismiss',
          { duration: 4000 }
        );
      },
    });
  }

  accept(request: IncomingFriendRequest): void {
    this.friendService.acceptRequest(request.requestId).subscribe({
      next: () => {
        this.requests.update(list => list.filter(r => r.requestId !== request.requestId));
        this.friends.update(list => [
          ...list,
          { friendId: request.senderId, friendUsername: request.senderUsername },
        ]);
        this.snackBar.open(`You are now friends with ${request.senderUsername}`, 'Dismiss', {
          duration: 3000,
        });
      },
      error: err => {
        this.snackBar.open(
          extractErrorMessage(err, 'Failed to accept request'),
          'Dismiss',
          { duration: 4000 }
        );
      },
    });
  }

  removeFriend(friend: Friend): void {
    this.friendService.removeFriend(friend.friendId).subscribe({
      next: () => {
        this.friends.update(list => list.filter(f => f.friendId !== friend.friendId));
        this.snackBar.open(`Removed ${friend.friendUsername} from friends`, 'Dismiss', {
          duration: 3000,
        });
      },
      error: err => {
        this.snackBar.open(
          extractErrorMessage(err, 'Failed to remove friend'),
          'Dismiss',
          { duration: 4000 }
        );
      },
    });
  }

  decline(request: IncomingFriendRequest): void {
    this.friendService.declineRequest(request.requestId).subscribe({
      next: () => {
        this.requests.update(list => list.filter(r => r.requestId !== request.requestId));
      },
      error: err => {
        this.snackBar.open(
          extractErrorMessage(err, 'Failed to decline request'),
          'Dismiss',
          { duration: 4000 }
        );
      },
    });
  }

  private loadFriends(): void {
    this.friendService.getFriends().subscribe({
      next: friends => {
        this.friends.set(friends);
        this.loadingFriends.set(false);
      },
      error: () => this.loadingFriends.set(false),
    });
  }

  private loadRequests(): void {
    this.friendService.getRequests().subscribe({
      next: requests => this.requests.set(requests),
    });
  }
}
