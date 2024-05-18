import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

// enum ProjectStatus {
export enum ProjectStatus {
  InProduction = 0,
  ongoing = 1,
}
@Injectable({
  providedIn: 'root',
})
export class ClientDetailsService {
  search = new FormControl<string | null>('');
  projectStatus = new FormControl<ProjectStatus>(ProjectStatus.InProduction);
  currentOnly = new FormControl<boolean>(true);
  ProjectStatus = ProjectStatus;
  showProjectStatus$ = new BehaviorSubject<boolean>(true);
  showCurrentOnly$ = new BehaviorSubject<boolean>(true);

  constructor() {}

  resetFilters() {
    this.search.setValue('');
    this.projectStatus.setValue(ProjectStatus.InProduction);
    this.currentOnly.setValue(true);
  }

  showProjectStatus() {
    this.showProjectStatus$.next(true);
  }

  hideProjectStatus() {
    this.showProjectStatus$.next(false);
  }

  showCurrentOnly() {
    this.showCurrentOnly$.next(true);
  }

  hideCurrentOnly() {
    this.showCurrentOnly$.next(false);
  }
}
