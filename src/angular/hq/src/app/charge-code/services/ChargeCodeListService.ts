import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ProjectStatus } from '../../clients/client-details.service';
import { GetPSRTimeRecordStaffV1 } from '../../models/PSR/get-psr-time-v1';

export enum ActivityName {
  Support = 0,
  Development = 1,
  Todo = 2,
}

@Injectable({
  providedIn: 'root',
})
export class ChargeCodeListService {
  staffMembers$ = new BehaviorSubject<GetPSRTimeRecordStaffV1[]>([]);
  search = new FormControl<string | null>('');
  roaster = new FormControl<string | null>('');

  projectStatus = new FormControl<ProjectStatus>(ProjectStatus.InProduction);
  activityName = new FormControl<ActivityName>(ActivityName.Development);
  staffMember = new FormControl<string | null>(null);
  isSubmitted = new FormControl<boolean | null>(false);

  ProjectStatus = ProjectStatus;
  ActivityName = ActivityName;

  showProjectStatus$ = new BehaviorSubject<boolean>(false);
  showSearch$ = new BehaviorSubject<boolean>(false);
  showStaffMembers$ = new BehaviorSubject<boolean>(false);
  showIsSubmitted$ = new BehaviorSubject<boolean>(false);

  showActivityName$ = new BehaviorSubject<boolean>(false);
  showRoaster$ = new BehaviorSubject<boolean>(false);

  constructor() {}

  resetFilter() {
    this.search.setValue('');
    this.projectStatus.setValue(ProjectStatus.InProduction);
    this.activityName.setValue(ActivityName.Development);
    this.staffMember.setValue(null);
    this.roaster.setValue('');
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
}
