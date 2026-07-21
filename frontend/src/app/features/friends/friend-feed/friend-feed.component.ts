import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FriendService } from '../../../core/services/friend.service';
import { FeedItem } from '../../../models/friend.model';
import { avatarColor } from '../../../core/utils/avatar-utils';
import { isCustomIcon } from '../../profile/profile-icons';

@Component({
  selector: 'rp-friend-feed',
  imports: [
    DatePipe,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './friend-feed.component.html',
  styleUrl: './friend-feed.component.scss',
})
export class FriendFeedComponent implements OnInit, AfterViewInit, OnDestroy {
  private friendService = inject(FriendService);
  private observer?: IntersectionObserver;

  readonly sentinel = viewChild.required<ElementRef<HTMLElement>>('sentinel');

  readonly items = signal<FeedItem[]>([]);
  readonly loading = signal(true);
  readonly done = signal(false);

  private nextCursor: string | null = null;

  ngOnInit(): void {
    this.loadPage();
  }

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting) && !this.loading() && !this.done()) {
        this.loadPage();
      }
    });
    this.observer.observe(this.sentinel().nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private loadPage(): void {
    this.loading.set(true);
    this.friendService.getFeed(this.nextCursor ?? undefined).subscribe({
      next: page => {
        this.items.update(items => [...items, ...page.items]);
        this.nextCursor = page.nextCursor;
        if (!page.nextCursor) this.done.set(true);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  sentCount(item: FeedItem): number {
    return item.routeAttempts.filter(a => a.sent).length;
  }

  readonly avatarColor = avatarColor;
  readonly isCustomIcon = isCustomIcon;
}
