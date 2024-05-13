import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule, RouterOutlet } from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import { AppSettingsService } from './app-settings.service';
import { CommonModule } from '@angular/common';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable, filter, map } from 'rxjs';
import { LayoutComponent } from './layout.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LayoutComponent, RouterOutlet],
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'HQ';
  appSettingsService = inject(AppSettingsService);
  oidcSecurityService = inject(OidcSecurityService);
  
  isAuthenticated$: Observable<boolean>;

  constructor() {
    this.oidcSecurityService
      .checkAuth()
      .subscribe(({ isAuthenticated, userData, accessToken, idToken, configId }) => { });

    this.isAuthenticated$ = this.oidcSecurityService.isAuthenticated$.pipe(
        map(t => t.isAuthenticated)
      );
  }

}
