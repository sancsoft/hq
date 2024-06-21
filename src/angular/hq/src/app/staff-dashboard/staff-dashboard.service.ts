import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Period } from '../projects/project-create/project-create.component';
import { HQService } from '../services/hq.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import {
  Observable,
  combineLatest,
  debounceTime,
  map,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { GetDashboardTimeV1Response } from '../models/staff-dashboard/get-dashboard-time-v1';

@Injectable({
  providedIn: 'root',
})
export class StaffDashboardService {
  search = new FormControl<string | null>(null);
  period = new FormControl<Period>(Period.Week, { nonNullable: true });
  date = new FormControl<string>(new Date().toISOString().split('T')[0], {
    nonNullable: true,
  });

  time$: Observable<GetDashboardTimeV1Response>;

  constructor(
    private hqService: HQService,
    private oidcSecurityService: OidcSecurityService,
  ) {
    const staffId$ = oidcSecurityService.userData$.pipe(
      map((t) => t.userData),
      map((t) => t.staff_id as string),
    );

    const search$ = this.search.valueChanges.pipe(startWith(this.search.value));
    const period$ = this.period.valueChanges.pipe(startWith(this.period.value));
    const date$ = this.date.valueChanges.pipe(startWith(this.date.value));

    const request$ = combineLatest({
      staffId: staffId$,
      period: period$,
      search: search$,
      date: date$,
    });

    this.time$ = request$.pipe(
      debounceTime(250),
      switchMap((request) => this.hqService.getDashboardTimeV1(request)),
      tap((response) =>
        this.date.setValue(response.startDate, { emitEvent: false }),
      ),
    );
  }
}
