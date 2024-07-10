import { FormControl } from '@angular/forms';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { GetPSRTimeRecordStaffV1 } from '../../../models/PSR/get-psr-time-v1';
import { HQService } from '../../../services/hq.service';
import { Injectable } from '@angular/core';
import { ProjectStatus } from '../../../enums/project-status';

@Injectable({
  providedIn: 'root',
})
export class PsrListService {
  staffMembers$: Observable<GetPSRTimeRecordStaffV1[]>;

  search = new FormControl<string | null>('');
  roaster = new FormControl<string | null>('');

  projectStatus = new FormControl<ProjectStatus>(ProjectStatus.InProduction);
  staffMember = new FormControl<string | null>(null);
  isSubmitted = new FormControl<boolean | null>(null);
  startDate = new FormControl<Date | null>(null);
  endDate = new FormControl<Date | null>(null);

  // Pagination form controls
  itemsPerPage = new FormControl(20, { nonNullable: true });
  page = new FormControl<number>(1, { nonNullable: true });

  ProjectStatus = ProjectStatus;

  showProjectStatus$ = new BehaviorSubject<boolean>(true);
  showSearch$ = new BehaviorSubject<boolean>(true);
  showStaffMembers$ = new BehaviorSubject<boolean>(true);
  showIsSubmitted$ = new BehaviorSubject<boolean>(true);
  showStartDate$ = new BehaviorSubject<boolean>(true);
  showEndDate$ = new BehaviorSubject<boolean>(true);

  showRoaster$ = new BehaviorSubject<boolean>(true);

  constructor(private hqService: HQService) {
    this.staffMembers$ = this.hqService
      .getStaffMembersV1({ isAssignedProjectManager: true })
      .pipe(
        map((response) => response.records),
        map((records) =>
          records.map((record) => ({
            id: record.id,
            name: record.name,
            totalHours: record.workHours,
          })),
        ),
      );
  }

  resetFilter() {
    this.search.setValue('');
    this.projectStatus.setValue(ProjectStatus.InProduction);
    this.staffMember.setValue(null);
    this.roaster.setValue('');
    this.isSubmitted.setValue(null);
    this.startDate.setValue(null);
    this.endDate.setValue(null);
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
}
