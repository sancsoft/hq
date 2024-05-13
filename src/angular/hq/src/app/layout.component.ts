import { Component, inject } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable, filter, map } from 'rxjs';
import { AppSettingsService } from './app-settings.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'hq-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatButtonModule, MatDividerModule, MatIconModule, FormsModule, MatFormFieldModule, MatInputModule, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html'
})
export class LayoutComponent {
  title = 'HQ';
  appSettingsService = inject(AppSettingsService);
  oidcSecurityService = inject(OidcSecurityService);

  dropdownOpen = false;

  userName$: Observable<string>;
  
  constructor() {
    this.userName$ = this.oidcSecurityService.userData$.pipe(
      filter(t => t.userData),
      map(t => t.userData.email)
    );
  }

  public logout() {
    this.oidcSecurityService
      .logoff()
      .subscribe((result) => console.log(result));
  }  
}
