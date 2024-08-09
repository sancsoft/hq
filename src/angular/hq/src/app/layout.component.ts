import { Component, inject } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable, filter, firstValueFrom, map } from 'rxjs';
import { AppSettingsService } from './app-settings.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { InRolePipe } from './pipes/in-role.pipe';
import { HQRole } from './enums/hqrole';
import { OverlayModule } from '@angular/cdk/overlay';

@Component({
  selector: 'hq-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    FormsModule,
    RouterLink,
    RouterLinkActive,
    InRolePipe,
    OverlayModule,
  ],
  templateUrl: './layout.component.html',
})
export class LayoutComponent {
  title = 'HQ';
  appSettingsService = inject(AppSettingsService);
  oidcSecurityService = inject(OidcSecurityService);

  dropdownOpen = false;
  settingDropdownOpen = false;

  HQRole = HQRole;

  userName$: Observable<string>;

  constructor() {
    this.userName$ = this.oidcSecurityService.userData$.pipe(
      filter((t) => t.userData),
      map((t) => t.userData.email),
    );
  }

  public async logout() {
    await firstValueFrom(this.oidcSecurityService.logoff());
  }
}
