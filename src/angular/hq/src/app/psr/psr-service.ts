import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ProjectStatus } from '../clients/client-details.service';
import { BehaviorSubject } from 'rxjs';



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


  ProjectStatus = ProjectStatus;
  ActivityName = ActivityName;
  showProjectStatus$ = new BehaviorSubject<boolean>(true);
  showActivityName$ = new BehaviorSubject<boolean>(true);
  showRoaster$ = new BehaviorSubject<boolean>(true);


  constructor() {}

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
