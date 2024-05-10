import { PassedInitialConfig, StsConfigHttpLoader, StsConfigLoader } from 'angular-auth-oidc-client';
import { AppSettingsService } from './app-settings.service';
import { map } from 'rxjs';

export const authConfig: PassedInitialConfig = {
  loader: {
    provide: StsConfigLoader,
    useFactory: (appSettingsService: AppSettingsService) => new StsConfigHttpLoader(appSettingsService.appSettings$.pipe(
      map(appSettings => ({
        authority: appSettings.auth.authorityUrl,
        redirectUrl: window.location.origin,
        postLogoutRedirectUri: window.location.origin,
        clientId: appSettings.auth.clientId,
        scope: appSettings.auth.scopes, 
        responseType: 'code',
        silentRenew: true,
        useRefreshToken: true,
        renewTimeBeforeTokenExpiresInSeconds: 30,
      }))
    )),
    deps: [AppSettingsService]
  }
}