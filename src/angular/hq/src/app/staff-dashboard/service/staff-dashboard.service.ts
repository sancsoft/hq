import { Injectable, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HQService } from '../../services/hq.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import {
  BehaviorSubject,
  Observable,
  ReplaySubject,
  Subject,
  combineLatest,
  debounceTime,
  filter,
  map,
  merge,
  shareReplay,
  startWith,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import {
  GetDashboardTimeV1ChargeCode,
  GetDashboardTimeV1Client,
  GetDashboardTimeV1Response,
} from '../../models/staff-dashboard/get-dashboard-time-v1';
import { localISODate } from '../../common/functions/local-iso-date';
import { TimeStatus } from '../../enums/time-status';
import { Period } from '../../enums/period';
import { HQRole } from '../../enums/hqrole';

@Injectable({
  providedIn: 'root',
})
export class StaffDashboardService implements OnDestroy {
  search = new FormControl<string | null>(null);
  period = new FormControl<Period>(Period.Today, { nonNullable: true });
  timeStatus = new FormControl<TimeStatus | null>(null);
  date = new FormControl<string>(localISODate(), {
    nonNullable: true,
  });
  planningPointdateForm = new FormControl(localISODate(), {
    nonNullable: true,
  });

  Period = Period;
  Status = TimeStatus;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  canSubmitSubject = new BehaviorSubject<boolean>(false);
  canSubmit$: Observable<boolean> = this.canSubmitSubject.asObservable();

  time$: Observable<GetDashboardTimeV1Response>;
  chargeCodes$: Observable<GetDashboardTimeV1ChargeCode[]>;
  clients$: Observable<GetDashboardTimeV1Client[]>;
  showAllRejectedTimes$ = new BehaviorSubject<boolean>(false);
  rejectedCount$: Observable<number>;

  staffId$: Observable<string>;
  private staffIdSubject = new BehaviorSubject<string | null>(null);

  refresh$ = new Subject<void>();

  canEdit$: Observable<boolean>;
  isAdmin$: Observable<boolean>;

  constructor(
    private hqService: HQService,
    private oidcSecurityService: OidcSecurityService,
  ) {
    const staffId$ = this.staffIdSubject.asObservable().pipe(
      filter((staffId) => staffId != null),
      map((staffId) => staffId!),
    );

    const refreshStaffId$ = this.refresh$.pipe(switchMap(() => staffId$));

    this.staffId$ = merge(staffId$, refreshStaffId$);

    const currentUserStaffId$ = oidcSecurityService.userData$.pipe(
      map((t) => t.userData),
      map((t) => t.staff_id as string),
    );

    this.isAdmin$ = oidcSecurityService.userData$.pipe(
      map((t) => t.userData),
      map(
        (t) =>
          t &&
          t.roles &&
          Array.isArray(t.roles) &&
          [HQRole.Administrator].some((role) => t.roles.includes(role)),
      ),
    );

    this.canEdit$ = combineLatest({
      staffId: this.staffId$,
      currentUserStaffId: currentUserStaffId$,
      isAdmin: this.isAdmin$,
    }).pipe(map((t) => t.isAdmin || t.staffId == t.currentUserStaffId));

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

    this.time$.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (t) => this.canSubmitSubject.next(t.canSubmit),
      error: console.error,
    });

    this.rejectedCount$ = this.time$.pipe(map((t) => t.rejectedCount));

    this.chargeCodes$ = this.time$.pipe(map((t) => t.chargeCodes));
    this.clients$ = this.time$.pipe(map((t) => t.clients));
  }

  refresh() {
    this.refresh$.next();
  }

  setStaffId(staffId: string) {
    this.staffIdSubject.next(staffId);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
