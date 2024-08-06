import { Component } from '@angular/core';
import { StaffDashboardComponent } from '../staff-dashboard/staff-dashboard.component';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { map, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'hq-dashboard',
  standalone: true,
  imports: [StaffDashboardComponent, CommonModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  staffId$: Observable<string>;

  constructor(private oidcSecurityService: OidcSecurityService) {
    this.staffId$ = this.oidcSecurityService.userData$.pipe(
      map((t) => t.userData),
      map((t) => t.staff_id as string),
    );
  }
}
