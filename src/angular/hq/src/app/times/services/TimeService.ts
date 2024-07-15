import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  map,
  startWith,
  switchMap,
} from 'rxjs';
import {
  GetTimeRecordClientsV1,
  GetTimeRecordProjectsV1,
  GetTimeRecordStaffV1,
  Period,
} from '../../models/times/get-time-v1';
import { HQService } from '../../services/hq.service';
import { SortColumn } from '../../models/staff-members/get-staff-member-v1';
import { TimeStatus } from '../../models/common/time-status';

export enum ActivityName {
  Support = 0,
  Development = 1,
  Todo = 2,
}

@Injectable({
  providedIn: 'root',
})
export class TimeService {
  staffMembers$: Observable<GetTimeRecordStaffV1[]>;
  clients$: Observable<GetTimeRecordClientsV1[]>;
  projects$: Observable<GetTimeRecordProjectsV1[]>;

  search = new FormControl<string | null>('');
  roaster = new FormControl<string | null>('');

  activityName = new FormControl<ActivityName>(ActivityName.Development);
  itemsPerPage = new FormControl(20, { nonNullable: true });
  page = new FormControl<number>(1, { nonNullable: true });
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

  ActivityName = ActivityName;
  Period = Period;

  showProjectStatus$ = new BehaviorSubject<boolean>(true);
  showSearch$ = new BehaviorSubject<boolean>(true);
  showStaffMembers$ = new BehaviorSubject<boolean>(true);
  showProjectActivities$ = new BehaviorSubject<boolean>(true);

  showIsSubmitted$ = new BehaviorSubject<boolean>(true);
  showStartDate$ = new BehaviorSubject<boolean>(false);
  showEndDate$ = new BehaviorSubject<boolean>(false);

  showActivityName$ = new BehaviorSubject<boolean>(true);
  showRoaster$ = new BehaviorSubject<boolean>(true);

  clientId$ = this.client.valueChanges.pipe(startWith(this.client.value));
  Status = TimeStatus;

  constructor(private hqService: HQService) {
    this.staffMembers$ = this.hqService
      .getStaffMembersV1({
        sortBy: SortColumn.Name,
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
    this.activityName.setValue(ActivityName.Development);
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

  showActivityName() {
    this.showActivityName$.next(true);
  }
  hideActivityName() {
    this.showActivityName$.next(false);
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
}
