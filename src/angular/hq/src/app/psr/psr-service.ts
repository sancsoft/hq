import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ProjectStatus } from '../clients/client-details.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PsrService {
  search = new FormControl<string | null>('');
  projectStatus = new FormControl<ProjectStatus>(ProjectStatus.InProduction);

  ProjectStatus = ProjectStatus;
  showProjectStatus$ = new BehaviorSubject<boolean>(true);

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
}
