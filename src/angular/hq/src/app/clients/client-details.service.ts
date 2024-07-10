import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ProjectStatus } from '../enums/project-status';

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
