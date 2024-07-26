import {
  Jurisdiciton,
  SortColumn,
} from './../../models/staff-members/get-staff-member-v1';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  startWith,
  combineLatest,
  map,
  tap,
  debounceTime,
  switchMap,
  shareReplay,
  BehaviorSubject,
} from 'rxjs';
import { Observable } from 'rxjs';
import { SortDirection } from '../../models/common/sort-direction';
import { HQService } from '../../services/hq.service';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from '../../common/paginator/paginator.component';
import { SortIconComponent } from '../../common/sort-icon/sort-icon.component';
import { GetStaffV1Record } from '../../models/staff-members/get-staff-member-v1';
import { HQRole } from '../../enums/hqrole';
import { InRolePipe } from '../../pipes/in-role.pipe';
import { StaffListService } from './staff-list.service';
import { StaffListSearchFilterComponent } from '../staff-list-search-filter/staff-list-search-filter.component';

@Component({
  selector: 'hq-staff-list',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    ReactiveFormsModule,
    PaginatorComponent,
    SortIconComponent,
    RouterLink,
    InRolePipe,
    StaffListSearchFilterComponent,
  ],
  templateUrl: './staff-list.component.html',
})
export class StaffListComponent {
  apiErrors: string[] = [];
  staffMembers$: Observable<GetStaffV1Record[]>;
  skipDisplay$: Observable<number>;
  takeToDisplay$: Observable<number>;
  totalRecords$: Observable<number>;
  sortOption$: BehaviorSubject<SortColumn>;
  sortDirection$: BehaviorSubject<SortDirection>;
  Jurisdiction = Jurisdiciton;
  itemsPerPage = new FormControl(20, { nonNullable: true });
  page = new FormControl<number>(1, { nonNullable: true });
  sortColumn = SortColumn;
  sortDirection = SortDirection;
  HQRole = HQRole;

  constructor(
    private hqService: HQService,
    private route: ActivatedRoute,
    public staffListService: StaffListService,
  ) {
    const itemsPerPage$ = this.itemsPerPage.valueChanges.pipe(
      startWith(this.itemsPerPage.value),
    );
    this.sortOption$ = new BehaviorSubject<SortColumn>(SortColumn.Name);
    this.sortDirection$ = new BehaviorSubject<SortDirection>(SortDirection.Asc);
    const page$ = this.page.valueChanges.pipe(startWith(this.page.value));

    const skip$ = combineLatest([itemsPerPage$, page$]).pipe(
      map(([itemsPerPage, page]) => (page - 1) * itemsPerPage),
      startWith(0),
    );
    const search$ = staffListService.search.valueChanges.pipe(
      tap(() => this.goToPage(1)),
      startWith(staffListService.search.value),
    );
    const currentOnly$ = staffListService.currentOnly.valueChanges.pipe(
      tap(() => this.goToPage(1)),
      startWith(staffListService.currentOnly.value),
    );
    this.skipDisplay$ = skip$.pipe(map((skip) => skip + 1));

    const request$ = combineLatest({
      search: search$,
      skip: skip$,
      take: itemsPerPage$,
      sortBy: this.sortOption$,
      sortDirection: this.sortDirection$,
      currentOnly: currentOnly$,
    });

    const response$ = request$.pipe(
      debounceTime(500),
      switchMap((request) => this.hqService.getStaffMembersV1(request)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.staffMembers$ = response$.pipe(
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

  onSortClick(sortColumn: SortColumn) {
    if (this.sortOption$.value == sortColumn) {
      this.sortDirection$.next(
        this.sortDirection$.value == SortDirection.Asc
          ? SortDirection.Desc
          : SortDirection.Asc,
      );
    } else {
      this.sortOption$.next(sortColumn);
      this.sortDirection$.next(SortDirection.Asc);
    }
    this.page.setValue(1);
  }
}
