import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

// enum ProjectStatus {
export enum ProjectStatus {
  Unknown = 0,
  Draft = 1,
  WaitingForSale = 2,
  WaitingForClient = 3,
  WaitingForStaff = 4,
  InProduction = 5,
  Ongoing = 6,
  Completed = 7,
  Closed = 8,
  Lost = 9,
}
@Injectable({
  providedIn: 'root',
})
export class ClientDetailsService {
  search = new FormControl<string | null>('');
  projectStatus = new FormControl<ProjectStatus | null>(null);
  ProjectStatus = ProjectStatus;
  showProjectStatus$ = new BehaviorSubject<boolean>(true);

  constructor() {}

  resetFilters() {
    this.search.setValue('');
    this.projectStatus.setValue(null);
  }

  showProjectStatus() {
    this.showProjectStatus$.next(true);
  }

  hideProjectStatus() {
    this.showProjectStatus$.next(false);
  }
}

@Injectable({
  providedIn: 'root',
})
export class ClientDetailsServiceToReplace {
  search = new FormControl<string | null>('');
  projectStatus = new FormControl<ProjectStatus | null>(null);
  ProjectStatus = ProjectStatus;
  showProjectStatus$ = new BehaviorSubject<boolean>(true);

  constructor() {}

  resetFilters() {
    this.search.setValue('');
    this.projectStatus.setValue(null);
  }

  showProjectStatus() {
    this.showProjectStatus$.next(true);
  }

  hideProjectStatus() {
    this.showProjectStatus$.next(false);
  }
}
