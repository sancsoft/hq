import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientDetailsService {

  search = new FormControl<string|null>('');
  projectStatus = new FormControl<number>(0);
  currentOnly = new FormControl<boolean>(true);

  showProjectStatus$ = new BehaviorSubject<boolean>(true);
  showCurrentOnly$ = new BehaviorSubject<boolean>(true);

  constructor() { }

  resetFilters() {
    this.search.reset();
    this.projectStatus.reset();
    this.currentOnly.reset();
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
