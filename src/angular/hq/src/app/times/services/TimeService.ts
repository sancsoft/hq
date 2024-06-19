import { Injectable, OnDestroy } from "@angular/core";
import { FormControl } from "@angular/forms";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { GetPSRTimeRecordStaffV1 } from "../../models/PSR/get-psr-time-v1";
import { GetTimeRecordClientsV1, GetTimeRecordProjectsV1, GetTimeRecordStaffV1, Period } from "../../models/times/get-time-v1";


export enum ActivityName {
  Support = 0,
  Development = 1,
  Todo = 2,
}

@Injectable({
  providedIn: 'root',
})
export class TimeService {

  staffMembers$ = new BehaviorSubject<GetTimeRecordStaffV1[]>([]);
  clients$ = new BehaviorSubject<GetTimeRecordClientsV1[]>([]);
  projects$ = new BehaviorSubject<GetTimeRecordProjectsV1[]>([]);

  search = new FormControl<string | null>('');
  roaster = new FormControl<string | null>('');

  activityName = new FormControl<ActivityName>(ActivityName.Development);
  itemsPerPage = new FormControl(20, { nonNullable: true });
  page = new FormControl<number>(1, { nonNullable: true });
  staffMember = new FormControl<string | null>(null);
  client = new FormControl<string | null>(null);
  project = new FormControl<string | null>(null);
  selectedPeriod = new FormControl<Period | null>(Period.ThisMonth);


  projectActivity = new FormControl<string | null>(null);
  isSubmitted = new FormControl<boolean | null>(null);
  startDate = new FormControl<Date | null>(null);
  endDate = new FormControl<Date | null>(null);

  ActivityName = ActivityName;
  Period = Period;

  showProjectStatus$ = new BehaviorSubject<boolean>(true);
  showSearch$ = new BehaviorSubject<boolean>(true);
  showStaffMembers$ = new BehaviorSubject<boolean>(true);
  showProjectActivities$ = new BehaviorSubject<boolean>(true);

  showIsSubmitted$ = new BehaviorSubject<boolean>(true);
  showStartDate$ = new BehaviorSubject<boolean>(true);
  showEndDate$ = new BehaviorSubject<boolean>(true);




  showActivityName$ = new BehaviorSubject<boolean>(true);
  showRoaster$ = new BehaviorSubject<boolean>(true);

  constructor() {}

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
