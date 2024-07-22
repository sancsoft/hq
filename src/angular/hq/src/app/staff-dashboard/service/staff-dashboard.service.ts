import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Period } from '../../projects/project-create/project-create.component';
import { HQService } from '../../services/hq.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import {
  BehaviorSubject,
  Observable,
  Subject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  merge,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import {
  GetDashboardTimeV1ChargeCode,
  GetDashboardTimeV1Client,
  GetDashboardTimeV1Response,
} from '../../models/staff-dashboard/get-dashboard-time-v1';
import { TimeStatus } from '../../models/common/time-status';
import { localISODate } from '../../common/functions/local-iso-date';

@Injectable({
  providedIn: 'root',
})
export class StaffDashboardService {
  search = new FormControl<string | null>(null);
  period = new FormControl<Period>(Period.Today, { nonNullable: true });
  timeStatus = new FormControl<TimeStatus | null>(null);
  date = new FormControl<string>(localISODate(), {
    nonNullable: true,
  });

  Period = Period;
  Status = TimeStatus;

  canSubmit$: Observable<boolean>;
  time$: Observable<GetDashboardTimeV1Response>;
  chargeCodes$: Observable<GetDashboardTimeV1ChargeCode[]>;
  clients$: Observable<GetDashboardTimeV1Client[]>;
  showAllRejectedTimes$ = new BehaviorSubject<boolean>(false);
  rejectedCount$: Observable<number>;

  refresh$ = new Subject<void>();

  constructor(
    private hqService: HQService,
    private oidcSecurityService: OidcSecurityService,
  ) {
    const staffId$ = oidcSecurityService.userData$.pipe(
      map((t) => t.userData),
      map((t) => t.staff_id as string),
      distinctUntilChanged(),
    );

    const search$ = this.search.valueChanges.pipe(startWith(this.search.value));
    const period$ = this.period.valueChanges.pipe(startWith(this.period.value));
    const timeStatus$ = this.timeStatus.valueChanges.pipe(
      startWith(this.timeStatus.value),
    );

    const date$ = this.date.valueChanges
      .pipe(startWith(this.date.value))
      .pipe(map((t) => t || localISODate()));

    const request$ = combineLatest({
      staffId: staffId$,
      period: period$,
      search: search$,
      date: date$,
      status: timeStatus$,
    }).pipe(shareReplay({ bufferSize: 1, refCount: false }));
    
    const time$ = request$.pipe(
      debounceTime(250),
      switchMap((request) => this.hqService.getDashboardTimeV1(request)),
      tap((response) =>
        this.date.setValue(response.startDate, { emitEvent: false }),
      ),
    );

    const refreshTime$ = this.refresh$.pipe(switchMap(() => time$));

    this.time$ = merge(time$, refreshTime$).pipe(
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.canSubmit$ = this.time$.pipe(map((t) => t.canSubmit));

    this.rejectedCount$ = this.time$.pipe(map((t) => t.rejectedCount));

    this.chargeCodes$ = this.time$.pipe(map((t) => t.chargeCodes));
    this.clients$ = this.time$.pipe(map((t) => t.clients));
  }
  refresh() {
    this.refresh$.next();
  }
}
