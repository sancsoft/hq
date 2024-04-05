import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AppSettingsService } from './app-settings.service';
import { provideHttpClient } from '@angular/common/http';
import { provideAuth } from 'angular-auth-oidc-client';
import { authConfig } from './auth.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(),
    {
        provide: APP_INITIALIZER,
        useFactory: (appSettingsService: AppSettingsService) => () => appSettingsService.appSettings$,
        multi: true,
        deps: [AppSettingsService],
    },
    provideAuth(authConfig)
],
};
