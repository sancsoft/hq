import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ProjectStatus } from '../clients/client-details.service';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { GetStaffV1Record } from '../models/staff-members/get-staff-member-v1';
import { HQService } from '../services/hq.service';

export enum ActivityName {
  Support = 0,
  Development = 1,
  Todo = 2,
}

@Injectable({
  providedIn: 'root',
})
export class PsrService {
  search = new FormControl<string | null>('');
  roaster = new FormControl<string | null>('');

  projectStatus = new FormControl<ProjectStatus>(ProjectStatus.InProduction);
  activityName = new FormControl<ActivityName>(ActivityName.Development);
  projectManager = new FormControl<string | null>(null);

  ProjectStatus = ProjectStatus;
  ActivityName = ActivityName;
  showProjectStatus$ = new BehaviorSubject<boolean>(true);
  showProjectManagers$ = new BehaviorSubject<boolean>(true);
  projectManagers$: Observable<GetStaffV1Record[]>;

  showActivityName$ = new BehaviorSubject<boolean>(true);
  showRoaster$ = new BehaviorSubject<boolean>(true);

  constructor(private hqService: HQService) {
    const response$ = this.hqService.getStaffMembersV1({});
    this.projectManagers$ = response$.pipe(
      map((response) => {
        return response.records;
      })
    );


  }

  resetFilter() {
    this.search.setValue('');
    this.projectStatus.setValue(ProjectStatus.InProduction);
  }
  showProjectStatus() {
    this.showProjectStatus$.next(true);
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
  showProjectManagers() {
    this.showProjectManagers$.next(true);
  }
  hideProjectManagers() {
    this.showProjectManagers$.next(false);
  }
}
