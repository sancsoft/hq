import { ConfirmationModalComponent } from './common/confirmation-modal/confirmation-modal.component';
import { HqSnackBarComponent } from './common/hq-snack-bar/hq-snack-bar.component';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule, RouterOutlet } from '@angular/router';
import { AppSettingsService } from './app-settings.service';
import { CommonModule } from '@angular/common';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable, filter, map } from 'rxjs';
import { LayoutComponent } from './layout.component';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ToastComponent } from './common/toast/toast.component';
import { ToastService } from './services/toast.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LayoutComponent, RouterOutlet, HqSnackBarComponent, ConfirmationModalComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'HQ';
  appSettingsService = inject(AppSettingsService);
  oidcSecurityService = inject(OidcSecurityService);
  overlay = inject(Overlay);
  toastService = inject(ToastService);

  isAuthenticated$: Observable<boolean>;

  constructor() {
    this.oidcSecurityService
      .checkAuth()
      .subscribe(({ isAuthenticated, userData, accessToken, idToken, configId }) => { });

    this.isAuthenticated$ = this.oidcSecurityService.isAuthenticated$.pipe(
        map(t => t.isAuthenticated)
      );

    this.setupToastOverlay();
  }

  private setupToastOverlay() {
    const overlayRef = this.overlay.create({
      width: '250px',
      positionStrategy: this.overlay.position()
        .global()
        .bottom('0px')
        .right('0px')
    });

    const userProfilePortal = new ComponentPortal(ToastComponent);
    overlayRef.attach(userProfilePortal);
  }

}
