import { ConfirmationModalComponent } from './common/confirmation-modal/confirmation-modal.component';
import { HqSnackBarComponent } from './common/hq-snack-bar/hq-snack-bar.component';
import { Component, OnDestroy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppSettingsService } from './app-settings.service';
import { CommonModule } from '@angular/common';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable, Subject, map, takeUntil } from 'rxjs';
import { LayoutComponent } from './layout.component';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ToastComponent } from './common/toast/toast.component';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'hq-root',
  standalone: true,
  imports: [
    CommonModule,
    LayoutComponent,
    RouterOutlet,
    HqSnackBarComponent,
    ConfirmationModalComponent,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnDestroy {
  title = 'HQ';
  appSettingsService = inject(AppSettingsService);
  oidcSecurityService = inject(OidcSecurityService);
  overlay = inject(Overlay);
  toastService = inject(ToastService);

  isAuthenticated$: Observable<boolean>;

  private destroy = new Subject<void>();

  constructor() {
    this.oidcSecurityService
      .checkAuth()
      .pipe(takeUntil(this.destroy))
      // eslint-disable-next-line rxjs-angular/prefer-async-pipe
      .subscribe({
        next: () => {},
        error: (error: unknown) => {
          console.error(error);
          window.location.href = '/';
        },
      });

    this.isAuthenticated$ = this.oidcSecurityService.isAuthenticated$.pipe(
      map((t) => t.isAuthenticated),
    );

    this.setupToastOverlay();
  }

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }

  private setupToastOverlay() {
    const overlayRef = this.overlay.create({
      width: '250px',
      positionStrategy: this.overlay
        .position()
        .global()
        .bottom('0px')
        .right('0px'),
    });

    const userProfilePortal = new ComponentPortal(ToastComponent);
    overlayRef.attach(userProfilePortal);
  }
}
