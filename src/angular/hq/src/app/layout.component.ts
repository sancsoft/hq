import { Component, inject } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable, filter, firstValueFrom, map } from 'rxjs';
import { AppSettingsService } from './app-settings.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { InRolePipe } from './pipes/in-role.pipe';
import { HQRole } from './enums/hqrole';
import { ModalService } from './services/modal.service';

@Component({
  selector: 'hq-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule, RouterLink, RouterLinkActive, InRolePipe],
  templateUrl: './layout.component.html'
})
export class LayoutComponent {
  title = 'HQ';
  appSettingsService = inject(AppSettingsService);
  oidcSecurityService = inject(OidcSecurityService);

  dropdownOpen = false;

  HQRole = HQRole;

  userName$: Observable<string>;
  
  constructor(
    public modalService: ModalService
  ) {
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

  async alert() {
    const result = await firstValueFrom(this.modalService.alert('Alert title', 'Alert message'));
    console.log(result);
  }

  async confirm() {
    const result = await firstValueFrom(this.modalService.confirm('Confirm title', 'Confirm message'));
    console.log(result);
  }

  async prompt() {
    const result = await firstValueFrom(this.modalService.prompt('Prompt title', 'Prompt message'));
    console.log(result);
  }

}
