import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Period } from '../projects/project-create/project-create.component';
import { HQService } from '../services/hq.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable, combineLatest, map, startWith, switchMap } from 'rxjs';
import { GetDashboardTimeV1Response } from '../models/staff-dashboard/get-dashboard-time-v1';

@Injectable({
  providedIn: 'root',
})
export class StaffDashboardService {
  search = new FormControl<string | null>(null);
  period = new FormControl<Period>(Period.Week, { nonNullable: true });
  startDate = new FormControl<string | null>(null);

  time$: Observable<GetDashboardTimeV1Response>;

  constructor(
    private hqService: HQService,
    private oidcSecurityService: OidcSecurityService,
  ) {
    const staffId$ = oidcSecurityService.userData$.pipe(
      map((t) => t.userData),
      map((t) => t.staff_id as string),
    );

    const period$ = this.period.valueChanges.pipe(startWith(this.period.value));

    const request$ = combineLatest({
      staffId: staffId$,
      period: period$,
    });

    this.time$ = request$.pipe(
      switchMap((request) => this.hqService.getDashboardTimeV1(request)),
    );
  }
}
