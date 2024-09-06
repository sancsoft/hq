import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  combineLatest,
  debounceTime,
  Observable,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import {
  GetStaffV1Record,
  GetStaffV1Response,
  SortColumn,
} from '../../models/staff-members/get-staff-member-v1';
import { SortDirection } from '../../models/common/sort-direction';
import { HQService } from '../../services/hq.service';
import { BaseListService } from '../../core/services/base-list.service';

@Injectable({
  providedIn: 'root',
})
export class StaffListService extends BaseListService<
  GetStaffV1Response,
  GetStaffV1Record,
  SortColumn
> {
  constructor(private hqService: HQService) {
    super(SortColumn.Name, SortDirection.Asc);
  }
  status = new FormControl<string | null>(null);
  currentOnly = new FormControl<boolean>(true);

  protected override getResponse(): Observable<GetStaffV1Response> {
    const currentOnly$ = this.currentOnly.valueChanges.pipe(
      startWith(this.currentOnly.value),
    );
    const status$ = this.status.valueChanges.pipe(startWith(this.status.value));

    return combineLatest({
      search: this.search$,
      skip: this.skip$,
      take: this.itemsPerPage$,
      sortBy: this.sortOption$,
      sortDirection: this.sortDirection$,
      currentOnly: currentOnly$,
      status: status$,
    }).pipe(
      debounceTime(500),
      tap(() => this.loadingSubject.next(true)),
      switchMap((request) => this.hqService.getStaffMembersV1(request)),
      tap(() => this.loadingSubject.next(false)),
    );
  }
}
