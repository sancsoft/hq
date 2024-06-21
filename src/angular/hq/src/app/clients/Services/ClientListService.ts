import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ProjectStatus } from '../../clients/client-details.service';
import { GetPSRTimeRecordStaffV1 } from '../../models/PSR/get-psr-time-v1';

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
