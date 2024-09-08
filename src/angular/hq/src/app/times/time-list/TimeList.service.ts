import { GetTimeRecordsV1, SortColumn } from '../../models/times/get-time-v1';
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
  GetTimeRecordV1,
} from '../../models/times/get-time-v1';
import { HQService } from '../../services/hq.service';
import { SortColumn as staffSortColumn } from '../../models/staff-members/get-staff-member-v1';
import { Period } from '../../enums/period';
import { TimeStatus } from '../../enums/time-status';
import { BaseListService } from '../../core/services/base-list.service';
import { SortDirection } from '../../models/common/sort-direction';

@Injectable({
  providedIn: 'root',
})
export class TimeListService extends BaseListService<
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

  showProjectStatus$ = new BehaviorSubject<boolean>(true);
  showSearch$ = new BehaviorSubject<boolean>(true);
  showStaffMembers$ = new BehaviorSubject<boolean>(true);
  showProjectActivities$ = new BehaviorSubject<boolean>(true);

  showIsSubmitted$ = new BehaviorSubject<boolean>(true);
  showStartDate$ = new BehaviorSubject<boolean>(false);
  showEndDate$ = new BehaviorSubject<boolean>(false);

  showRoaster$ = new BehaviorSubject<boolean>(true);

  clientId$ = this.client.valueChanges.pipe(startWith(this.client.value));
  Status = TimeStatus;

  constructor(private hqService: HQService) {
    super(SortColumn.Date, SortDirection.Desc);

    this.staffMembers$ = this.hqService
      .getStaffMembersV1({
        sortBy: staffSortColumn.Name,
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

  protected override getResponse(): Observable<GetTimeRecordsV1> {
    const projectId$ = this.project.valueChanges.pipe(
      startWith(this.project.value),
    );
    const staffMemberId$ = this.staffMember.valueChanges.pipe(
      startWith(this.staffMember.value),
    );
    const startDate$ = this.startDate.valueChanges.pipe(
      startWith(this.startDate.value),
    );
    const endDate$ = this.endDate.valueChanges.pipe(
      startWith(this.endDate.value),
    );
    const period$ = this.selectedPeriod.valueChanges.pipe(
      startWith(this.selectedPeriod.value),
    );
    const invoiced$ = this.invoiced.valueChanges.pipe(
      startWith(this.invoiced.value),
    );
    const timeStatus$ = this.timeStatus.valueChanges.pipe(
      startWith(this.timeStatus.value),
    );
    const combinedParams = {
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
    };

    return combineLatest(combinedParams).pipe(
      debounceTime(500),
      tap(() => this.loadingSubject.next(true)),
      switchMap((request) => this.hqService.getTimesV1(request)),
      tap(() => this.loadingSubject.next(false)),
    );
  }
}
