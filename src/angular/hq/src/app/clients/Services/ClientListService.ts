import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ClientListService {
  search = new FormControl<string | null>('');
  showSearch$ = new BehaviorSubject<boolean>(true);
  itemsPerPage = new FormControl(20, { nonNullable: true });
  page = new FormControl<number>(1, { nonNullable: true });

  constructor() {}

  resetFilter() {
    this.search.setValue('');
  }
  showSearch() {
    this.showSearch$.next(true);
  }

  hideSearch() {
    this.showSearch$.next(false);
  }
}
