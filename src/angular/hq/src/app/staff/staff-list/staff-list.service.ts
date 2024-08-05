import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  map,
  Observable,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import {
  GetStaffV1Record,
  SortColumn,
} from '../../models/staff-members/get-staff-member-v1';
import { SortDirection } from '../../models/common/sort-direction';
import { HQService } from '../../services/hq.service';

@Injectable({
  providedIn: 'root',
})
export class StaffListService {
  search = new FormControl<string | null>(null);
  status = new FormControl<string | null>(null);

  itemsPerPage = new FormControl(20, { nonNullable: true });
  page = new FormControl<number>(1, { nonNullable: true });
  sortOption$ = new BehaviorSubject<SortColumn>(SortColumn.Name);
  sortDirection$ = new BehaviorSubject<SortDirection>(SortDirection.Asc);
  records$: Observable<GetStaffV1Record[]>;
  skipDisplay$: Observable<number>;
  takeToDisplay$: Observable<number>;
  totalRecords$: Observable<number>;
  currentOnly = new FormControl<boolean>(true);

  constructor(private hqService: HQService) {
    const page$ = this.page.valueChanges.pipe(startWith(this.page.value));

    const currentOnly$ = this.currentOnly.valueChanges.pipe(
      startWith(this.currentOnly.value),
    );
    const itemsPerPage$ = this.itemsPerPage.valueChanges.pipe(
      startWith(this.itemsPerPage.value),
    );

    const skip$ = combineLatest([itemsPerPage$, page$]).pipe(
      map(([itemsPerPage, page]) => (page - 1) * itemsPerPage),
      startWith(0),
    );
    const search$ = this.search.valueChanges.pipe(
      tap(() => this.goToPage(1)),
      startWith(this.search.value),
    );
    const status$ = this.status.valueChanges.pipe(startWith(this.status.value));

    this.skipDisplay$ = skip$.pipe(map((skip) => skip + 1));

    const request$ = combineLatest({
      search: search$,
      skip: skip$,
      take: itemsPerPage$,
      sortBy: this.sortOption$,
      sortDirection: this.sortDirection$,
      currentOnly: currentOnly$,
      status: status$,
    });

    const response$ = request$.pipe(
      debounceTime(500),
      switchMap((request) => this.hqService.getStaffMembersV1(request)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.records$ = response$.pipe(
      map((response) => {
        return response.records;
      }),
    );

    this.totalRecords$ = response$.pipe(map((t) => t.total!));

    this.takeToDisplay$ = combineLatest([
      skip$,
      itemsPerPage$,
      this.totalRecords$,
    ]).pipe(
      map(([skip, itemsPerPage, totalRecords]) =>
        Math.min(skip + itemsPerPage, totalRecords),
      ),
    );
  }
  goToPage(page: number) {
    this.page.setValue(page);
  }
}
