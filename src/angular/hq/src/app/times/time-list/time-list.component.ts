import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, BehaviorSubject, startWith, combineLatest, map, tap, debounceTime, switchMap, shareReplay } from 'rxjs';
import { GetTimeRecordV1, GetTimeRecordsV1, SortColumn } from '../../models/times/get-time-v1';
import { SortDirection } from '../../models/common/sort-direction';
import { HQService } from '../../services/hq.service';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from '../../common/paginator/paginator.component';
import { SortIconComponent } from '../../common/sort-icon/sort-icon.component';
import { ChargeCodeListService } from '../../charge-code/services/ChargeCodeListService';

@Component({
  selector: 'hq-time-list',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    ReactiveFormsModule,
    PaginatorComponent,
    SortIconComponent,
  ],
  templateUrl: './time-list.component.html'
})
export class TimeListComponent implements OnInit {
  ngOnInit(): void {
    this.chargeCodeListService.showSearch();
  }
  apiErrors: string[] = [];

  skipDisplay$: Observable<number>;
  takeToDisplay$: Observable<number>;
  totalRecords$: Observable<number>;
  times$: Observable<GetTimeRecordV1[]>;
  sortOption$: BehaviorSubject<SortColumn>;
  sortDirection$: BehaviorSubject<SortDirection>;

  itemsPerPage = new FormControl(20, { nonNullable: true });
  page = new FormControl<number>(1, { nonNullable: true });

  sortColumn = SortColumn;
  sortDirection = SortDirection;

  constructor(
    private hqService: HQService,
    private route: ActivatedRoute,
    private chargeCodeListService: ChargeCodeListService
  ) {
    this.sortOption$ = new BehaviorSubject<SortColumn>(SortColumn.Date);
    this.sortDirection$ = new BehaviorSubject<SortDirection>(SortDirection.Desc);

    const itemsPerPage$ = this.itemsPerPage.valueChanges.pipe(
      startWith(this.itemsPerPage.value)
    );
    const page$ = this.page.valueChanges.pipe(startWith(this.page.value));

    const skip$ = combineLatest([itemsPerPage$, page$]).pipe(
      map(([itemsPerPage, page]) => (page - 1) * itemsPerPage),
      startWith(0)
    );
    const search$ = chargeCodeListService.search.valueChanges.pipe(
      tap((t) => this.goToPage(1)),
      startWith(chargeCodeListService.search.value)
    );

    this.skipDisplay$ = skip$.pipe(map((skip) => skip + 1));

    const request$ = combineLatest({
      search: search$,
      skip: skip$,
      take: itemsPerPage$,
      sortBy: this.sortOption$,
      sortDirection: this.sortDirection$,
    });

    const response$ = request$.pipe(
      debounceTime(500),
      switchMap((request) => this.hqService.getTimesV1(request)),
      shareReplay(1)
    );

    this.times$ = response$.pipe(
      map((response) => {
        return response.records;
      })
    );

    this.totalRecords$ = response$.pipe(map((t) => t.total!));
    this.times$.subscribe((records) => {
      console.log(records);
    });

    this.takeToDisplay$ = combineLatest([
      skip$,
      itemsPerPage$,
      this.totalRecords$,
    ]).pipe(
      map(([skip, itemsPerPage, totalRecords]) =>
        Math.min(skip + itemsPerPage, totalRecords)
      )
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
          : SortDirection.Asc
      );
    } else {
      this.sortOption$.next(sortColumn);
      this.sortDirection$.next(SortDirection.Asc);
    }
    this.page.setValue(1);
  }
  // getProjectSatusString(status: ProjectStatus): string {
  //   return ProjectStatus[status];
  // }
}
