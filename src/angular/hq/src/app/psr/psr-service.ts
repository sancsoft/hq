import { Injectable, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { HQService } from '../services/hq.service';
import { GetPSRTimeRecordStaffV1 } from '../models/PSR/get-psr-time-v1';
import { GetProjectActivityRecordV1 } from '../models/PSR/get-project-activity-v1';
import { ProjectStatus } from '../enums/project-status';

@Injectable({
  providedIn: 'root',
})
export class PsrService implements OnDestroy {
  ngOnDestroy(): void {
    console.log('PSR SERVICE DESTROYED');
  }
  staffMembers$ = new BehaviorSubject<GetPSRTimeRecordStaffV1[]>([]);
  projectActivities$ = new BehaviorSubject<GetProjectActivityRecordV1[]>([]);

  search = new FormControl<string | null>('');
  roaster = new FormControl<string | null>('');

  projectStatus = new FormControl<ProjectStatus>(ProjectStatus.InProduction);
  staffMember = new FormControl<string | null>(null);
  projectActivity = new FormControl<string | null>(null);
  isSubmitted = new FormControl<boolean | null>(null);
  startDate = new FormControl<Date | null>(null);
  endDate = new FormControl<Date | null>(null);

  ProjectStatus = ProjectStatus;

  showProjectStatus$ = new BehaviorSubject<boolean>(true);
  showSearch$ = new BehaviorSubject<boolean>(true);
  showStaffMembers$ = new BehaviorSubject<boolean>(true);
  showProjectActivities$ = new BehaviorSubject<boolean>(true);

  showIsSubmitted$ = new BehaviorSubject<boolean>(true);
  showStartDate$ = new BehaviorSubject<boolean>(true);
  showEndDate$ = new BehaviorSubject<boolean>(true);

  showRoaster$ = new BehaviorSubject<boolean>(true);

  constructor(private hqService: HQService) {}

  resetFilter() {
    this.search.setValue('');
    this.projectStatus.setValue(ProjectStatus.InProduction);
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
}
