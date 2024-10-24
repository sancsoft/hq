import {
  PassedInitialConfig,
  StsConfigHttpLoader,
  StsConfigLoader,
} from 'angular-auth-oidc-client';
import { AppSettingsService } from './app-settings.service';
import { map } from 'rxjs';

export const authConfig: PassedInitialConfig = {
  loader: {
    provide: StsConfigLoader,
    useFactory: (appSettingsService: AppSettingsService) =>
      new StsConfigHttpLoader(
        appSettingsService.appSettings$.pipe(
          map((appSettings) => ({
            authority: appSettings.auth.authorityUrl,
            redirectUrl: window.location.origin + '/callback',
            postLogoutRedirectUri: window.location.origin,
            clientId: appSettings.auth.clientId,
            scope: appSettings.auth.scopes,
            responseType: 'code',
            silentRenew: true,
            useRefreshToken: true,
            // Randomly renew the access token between 30-120 seconds
            // See https://github.com/damienbod/angular-auth-oidc-client/issues/1662
            renewTimeBeforeTokenExpiresInSeconds:
              Math.floor(Math.random() * 90) + 30,
            ignoreNonceAfterRefresh: true,
            renewUserInfoAfterTokenRenew: true,
            secureRoutes: [appSettings.apiUrl],
          })),
        ),
      ),
    deps: [AppSettingsService],
  },
};
