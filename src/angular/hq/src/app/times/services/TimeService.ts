import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  debounceTime,
  map,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import {
  GetTimeRecordClientsV1,
  GetTimeRecordProjectsV1,
  GetTimeRecordStaffV1,
  GetTimeRecordsV1,
  GetTimeRecordV1,
  SortColumn,
} from '../../models/times/get-time-v1';
import { HQService } from '../../services/hq.service';

import { Period } from '../../enums/period';
import { TimeStatus } from '../../enums/time-status';
import { BaseListService } from '../../core/services/base-list.service';
import { SortDirection } from '../../models/common/sort-direction';
import { SortColumn as StaffSortColumn } from '../../models/staff-members/get-staff-member-v1';
import { enumToArray } from '../../core/functions/enum-to-array';

@Injectable({
  providedIn: 'root',
})
export class TimeService extends BaseListService<
  GetTimeRecordsV1,
  GetTimeRecordV1,
  SortColumn
> {
  staffMembers$: Observable<GetTimeRecordStaffV1[]>;
  clients$: Observable<GetTimeRecordClientsV1[]>;
  projects$: Observable<GetTimeRecordProjectsV1[]>;

  roaster = new FormControl<string | null>('');

  staffMember = new FormControl<string | null>(null);
  client = new FormControl<string | null>(null);
  project = new FormControl<string | null>(null);
  selectedPeriod = new FormControl<Period | null>(Period.Month);

  projectActivity = new FormControl<string | null>(null);
  isSubmitted = new FormControl<boolean | null>(null);
  invoiced = new FormControl<boolean | null>(null);
  timeStatus = new FormControl<TimeStatus | null>(null);

  startDate = new FormControl<Date | null>(null);
  endDate = new FormControl<Date | null>(null);

  Period = Period;
  PeriodList = enumToArray(Period);

  showProjectStatus$ = new BehaviorSubject<boolean>(true);
  showSearch$ = new BehaviorSubject<boolean>(true);
  showStaffMembers$ = new BehaviorSubject<boolean>(true);
  showProjectActivities$ = new BehaviorSubject<boolean>(true);

  showIsSubmitted$ = new BehaviorSubject<boolean>(true);
  showStartDate$ = new BehaviorSubject<boolean>(false);
  showEndDate$ = new BehaviorSubject<boolean>(false);

  showRoaster$ = new BehaviorSubject<boolean>(true);
  date$ = new BehaviorSubject<Date | null>(null);

  clientId$ = this.client.valueChanges.pipe(startWith(this.client.value));
  Status = TimeStatus;
  statusList = enumToArray(this.Status);

  constructor(private hqService: HQService) {
    super(SortColumn.Date, SortDirection.Asc);

    this.staffMembers$ = this.hqService
      .getStaffMembersV1({
        sortBy: StaffSortColumn.Name,
      })
      .pipe(map((members) => members.records));

    this.clients$ = this.hqService
      .getClientsV1({})
      .pipe(map((clients) => clients.records));

    const projectRequest$ = combineLatest({
      clientId: this.clientId$,
    });

    this.projects$ = projectRequest$.pipe(
      switchMap((projectRequest) =>
        this.hqService.getProjectsV1(projectRequest),
      ),
      map((clients) => clients.records),
    );
  }

  resetFilter() {
    this.search.setValue('');
    this.staffMember.setValue(null);
    this.roaster.setValue('');
    this.isSubmitted.setValue(null);
    this.startDate.setValue(null);
    this.endDate.setValue(null);
    this.projectActivity.setValue(null);
  }
  showProjectStatus() {
    this.showProjectStatus$.next(true);
  }
  showSearch() {
    this.showSearch$.next(true);
  }

  hideSearch() {
    this.showSearch$.next(false);
  }
  showStaffMembers() {
    this.showStaffMembers$.next(true);
  }
  hideStaffMembers() {
    this.showStaffMembers$.next(false);
  }
  hideProjectStatus() {
    this.showProjectStatus$.next(false);
  }
  showRoaster() {
    this.showRoaster$.next(true);
  }
  hideRoaster() {
    this.showRoaster$.next(false);
  }
  showIsSubmitted() {
    this.showIsSubmitted$.next(true);
  }
  hideIsSubmitted() {
    this.showIsSubmitted$.next(false);
  }

  showStartDate() {
    this.showStartDate$.next(true);
  }
  hideStartDate() {
    this.showStartDate$.next(false);
  }
  showEndDate() {
    this.showEndDate$.next(true);
  }
  hideEndDate() {
    this.showEndDate$.next(false);
  }
  showProjectActvities() {
    this.showProjectActivities$.next(true);
  }
  hideProjectActvities() {
    this.showProjectActivities$.next(false);
  }

  protected override getResponse(): Observable<GetTimeRecordsV1> {
    const staffMemberId$ = this.staffMember.valueChanges.pipe(
      startWith(this.staffMember.value),
    );

    const projectId$ = this.project.valueChanges.pipe(
      startWith(this.project.value),
    );
    const startDate$ = this.startDate.valueChanges.pipe(
      startWith(this.startDate.value),
      tap(() => {
        this.date$.next(null);
      }),
    );
    const endDate$ = this.endDate.valueChanges.pipe(
      startWith(this.endDate.value),
      tap(() => {
        this.date$.next(null);
      }),
    );
    const period$ = this.selectedPeriod.valueChanges.pipe(
      startWith(this.selectedPeriod.value),
      tap(() => {
        //
        this.date$.next(new Date());
      }),
    );
    const invoiced$ = this.invoiced.valueChanges.pipe(
      startWith(this.invoiced.value),
    );
    const timeStatus$ = this.timeStatus.valueChanges.pipe(
      startWith(this.timeStatus.value),
    );
    return combineLatest({
      search: this.search$,
      skip: this.skip$,
      clientId: this.clientId$,
      projectId: projectId$,
      staffId: staffMemberId$,
      take: this.itemsPerPage$,
      sortBy: this.sortOption$,
      startDate: startDate$,
      endDate: endDate$,
      period: period$,
      invoiced: invoiced$,
      timeStatus: timeStatus$,
      sortDirection: this.sortDirection$,
    }).pipe(
      debounceTime(500),
      tap(() => this.loadingSubject.next(true)),
      switchMap((request) => this.hqService.getTimesV1(request)),
      tap(() => this.loadingSubject.next(false)),
    );
  }
}
