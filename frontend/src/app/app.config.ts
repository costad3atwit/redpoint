import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { CUSTOM_PROFILE_ICONS } from './features/profile/profile-icons';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
    provideCharts(withDefaultRegisterables()),
    provideAppInitializer(() => {
      // Register custom SVG avatars served from public/icons/. Each icon is
      // fetched once on first use and cached by MatIconRegistry after that.
      const iconRegistry = inject(MatIconRegistry);
      const sanitizer = inject(DomSanitizer);
      for (const name of CUSTOM_PROFILE_ICONS) {
        iconRegistry.addSvgIcon(
          name,
          sanitizer.bypassSecurityTrustResourceUrl(`/icons/${name}.svg`)
        );
      }
    }),
  ],
};
