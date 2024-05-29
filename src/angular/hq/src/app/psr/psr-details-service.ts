import { Injectable, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ProjectStatus } from '../clients/client-details.service';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { GetStaffV1Record } from '../models/staff-members/get-staff-member-v1';
import { HQService } from '../services/hq.service';
import { GetPSRTimeRecordStaffV1 } from '../models/PSR/get-psr-time-v1';

export enum ActivityName {
  Support = 0,
  Development = 1,
  Todo = 2,
}

@Injectable({
  providedIn: 'root',
})
export class PsrDetailsService {
  staffMembers$ = new BehaviorSubject<GetPSRTimeRecordStaffV1[]>([]);
  search = new FormControl<string | null>('');
  roaster = new FormControl<string | null>('');

  projectStatus = new FormControl<ProjectStatus>(ProjectStatus.InProduction);
  activityName = new FormControl<ActivityName>(ActivityName.Development);
  staffMember = new FormControl<string | null>(null);

  ProjectStatus = ProjectStatus;
  ActivityName = ActivityName;
  showProjectStatus$ = new BehaviorSubject<boolean>(true);


  showActivityName$ = new BehaviorSubject<boolean>(true);
  showRoaster$ = new BehaviorSubject<boolean>(true);

  constructor(private hqService: HQService) {



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

}
