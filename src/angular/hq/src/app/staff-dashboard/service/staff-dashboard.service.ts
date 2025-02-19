import { SortColumn } from './../../models/times/get-time-v1';
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
  distinctUntilChanged,
  filter,
  map,
  merge,
  shareReplay,
  startWith,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { GetDashboardTimeV1Response } from '../../models/staff-dashboard/get-dashboard-time-v1';
import { localISODate } from '../../common/functions/local-iso-date';
import { TimeStatus } from '../../enums/time-status';
import { Period } from '../../enums/period';
import { HQRole } from '../../enums/hqrole';
import {
  GetChargeCodeRecordV1,
  SortColumn as ChargeCodeSortColumn,
} from '../../models/charge-codes/get-chargecodes-v1';
import { GetProjectActivityRecordV1 } from '../../models/projects/get-project-activity-v1';
import { SortDirection } from '../../models/common/sort-direction';

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
  timeEntryCutoffDate$: Observable<string>;
  time$: Observable<GetDashboardTimeV1Response>;
  chargeCodes$: Observable<GetChargeCodeRecordV1[]>;
  showAllRejectedTimes$ = new BehaviorSubject<boolean>(false);
  rejectedCount$: Observable<number>;
  staffId$: Observable<string>;
  activities$: Observable<GetProjectActivityRecordV1[]>;
  private staffIdSubject = new BehaviorSubject<string | null>(null);
  refresh$ = new Subject<void>();
  canEdit$: Observable<boolean>;
  canEditPoints$: Observable<boolean>;
  public sortOption$ = new BehaviorSubject<SortColumn>(SortColumn.Date);
  public sortDirection$ = new BehaviorSubject<SortDirection>(
    SortDirection.Desc,
  );
  localIsoDate = localISODate;

  constructor(
    private hqService: HQService,
    private oidcSecurityService: OidcSecurityService,
  ) {
    this.staffId$ = this.staffIdSubject.asObservable().pipe(
      filter((staffId) => staffId != null),
      map((staffId) => staffId!),
      distinctUntilChanged(),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    const currentUserStaffId$ = oidcSecurityService.userData$.pipe(
      map((t) => t.userData),
      map((t) => t.staff_id as string),
    );

    const isProjectManagerOrAbove$ = oidcSecurityService.userData$.pipe(
      map((t) => t.userData),
      map(
        (t) =>
          t &&
          t.roles &&
          Array.isArray(t.roles) &&
          [
            HQRole.Administrator,
            HQRole.Executive,
            HQRole.Partner,
            HQRole.Manager,
          ].some((role) => t.roles.includes(role)),
      ),
    );
    const chargeCodeResponse$ = this.staffId$.pipe(
      switchMap((staffId) =>
        this.hqService.getChargeCodeseV1({
          active: true,
          staffId,
          sortBy: ChargeCodeSortColumn.IsProjectMember,
        }),
      ),
    );
    this.chargeCodes$ = chargeCodeResponse$.pipe(
      map((chargeCode) => chargeCode.records),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.canEdit$ = combineLatest({
      staffId: this.staffId$,
      currentUserStaffId: currentUserStaffId$,
    }).pipe(
      map((t) => t.staffId == t.currentUserStaffId),
      distinctUntilChanged(),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.canEditPoints$ = combineLatest({
      staffId: this.staffId$,
      currentUserStaffId: currentUserStaffId$,
      isProjectManagerOrAbove: isProjectManagerOrAbove$,
    }).pipe(
      map(
        (t) => t.isProjectManagerOrAbove || t.staffId == t.currentUserStaffId,
      ),
      distinctUntilChanged(),
      shareReplay({ bufferSize: 1, refCount: false }),
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
      staffId: this.staffId$,
      period: period$,
      search: search$,
      date: date$,
      status: timeStatus$,
      sortBy: this.sortOption$,
      sortDirection: this.sortDirection$,
    }).pipe(shareReplay({ bufferSize: 1, refCount: false }));

    const time$ = request$.pipe(
      debounceTime(250),
      switchMap((request) => this.hqService.getDashboardTimeV1(request)),
      tap((response) =>
        this.date.setValue(response.startDate, { emitEvent: false }),
      ),
    );
    this.activities$ = this.hqService
      .getprojectActivitiesV1({ projectId: null })
      .pipe(
        map((t) => t.records),
        shareReplay({ bufferSize: 1, refCount: false }),
      );

    const refreshTime$ = this.refresh$.pipe(switchMap(() => time$));

    this.time$ = merge(time$, refreshTime$).pipe(
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.time$.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (t) => this.canSubmitSubject.next(t.canSubmit),
      error: console.error,
    });
    this.timeEntryCutoffDate$ = this.time$.pipe(
      map((t) => t.timeEntryCutoffDate),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.rejectedCount$ = this.time$.pipe(map((t) => t.rejectedCount));
  }

  refresh() {
    this.refresh$.next();
  }

  setStaffId(staffId: string) {
    this.staffIdSubject.next(staffId);
  }
  resetFilters() {
    this.period.setValue(Period.Today);
    this.search.setValue('');
    this.date.setValue(localISODate());
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
