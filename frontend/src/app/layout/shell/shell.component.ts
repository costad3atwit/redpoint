import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

const NAV_ITEMS = [
  { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
  { label: 'Sessions', route: '/sessions', icon: 'fitness_center' },
  { label: 'Analytics', route: '/analytics', icon: 'bar_chart' },
  { label: 'Feed', route: '/feed', icon: 'dynamic_feed' },
  { label: 'Friends', route: '/friends', icon: 'group' },
  { label: 'Profile', route: '/profile', icon: 'person' },
] as const;

@Component({
  selector: 'rp-shell',
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatListModule, MatIconModule, MatButtonModule],
})
export class ShellComponent {
  private breakpoint = inject(BreakpointObserver);

  readonly navItems = NAV_ITEMS;
  readonly isDesktop = toSignal(
    this.breakpoint.observe('(min-width: 960px)').pipe(map(r => r.matches)),
    { initialValue: true }
  );
}
