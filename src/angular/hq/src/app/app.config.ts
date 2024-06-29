import {
  APP_INITIALIZER,
  ApplicationConfig,
  importProvidersFrom,
} from '@angular/core';
import { TitleStrategy, provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AppSettingsService } from './app-settings.service';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  AbstractSecurityStorage,
  authInterceptor,
  provideAuth,
} from 'angular-auth-oidc-client';
import { authConfig } from './auth.config';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { AuthStorageService } from './auth-storage.service';
import { HQTitleStrategy } from './hq-title-strategy';
import { MarkdownModule, provideMarkdown } from 'ngx-markdown';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    importProvidersFrom(MonacoEditorModule.forRoot(), MarkdownModule.forRoot()),
    provideMarkdown(),
    provideHttpClient(withInterceptors([authInterceptor()])),
    provideAuth(authConfig),
    {
      provide: APP_INITIALIZER,
      useFactory: (appSettingsService: AppSettingsService) => () =>
        appSettingsService.appSettings$,
      multi: true,
      deps: [AppSettingsService],
    },
    {
      provide: AbstractSecurityStorage,
      useClass: AuthStorageService,
    },
    {
      provide: TitleStrategy,
      useClass: HQTitleStrategy,
    },
  ],
};
