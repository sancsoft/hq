import { Injectable } from '@angular/core';
import { ProjectStatus } from '../../enums/project-status';
import { FormControl } from '@angular/forms';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  map,
  merge,
  Observable,
  shareReplay,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { HQService } from '../../services/hq.service';
import { SortDirection } from '../../models/common/sort-direction';
import {
  GetQuotesRecordV1,
  SortColumn,
} from '../../models/quotes/get-quotes-v1';
import { formControlChanges } from '../../core/functions/form-control-changes';

@Injectable({
  providedIn: 'root',
})
export class QuoteListService {
  public ProjectStatus = ProjectStatus;

  search = new FormControl<string | null>(null);
  quoteStatus = new FormControl<ProjectStatus | null>(null);

  quotes$: Observable<GetQuotesRecordV1[]>;
  skipDisplay$: Observable<number>;
  takeToDisplay$: Observable<number>;
  totalRecords$: Observable<number>;
  sortOption$: BehaviorSubject<SortColumn>;
  sortDirection$: BehaviorSubject<SortDirection>;

  itemsPerPage = new FormControl(20, { nonNullable: true });
  page = new FormControl<number>(1, { nonNullable: true });

  refreshSubject = new Subject<void>();

  constructor(private hqService: HQService) {
    this.sortOption$ = new BehaviorSubject<SortColumn>(SortColumn.QuoteNumber);
    this.sortDirection$ = new BehaviorSubject<SortDirection>(
      SortDirection.Desc,
    );

    const itemsPerPage$ = formControlChanges(this.itemsPerPage);
    const page$ = formControlChanges(this.page);

    const skip$ = combineLatest([itemsPerPage$, page$]).pipe(
      map(([itemsPerPage, page]) => (page - 1) * itemsPerPage),
    );

    const search$ = formControlChanges(this.search).pipe(
      tap(() => this.goToPage(1)),
    );

    const quoteStatus$ = formControlChanges(this.quoteStatus).pipe(
      tap(() => this.goToPage(1)),
    );

    this.skipDisplay$ = skip$.pipe(map((skip) => skip + 1));

    const request$ = combineLatest({
      search: search$,
      skip: skip$,
      take: itemsPerPage$,
      sortBy: this.sortOption$,
      quoteStatus: quoteStatus$,
      sortDirection: this.sortDirection$,
    }).pipe(debounceTime(500), shareReplay({ bufferSize: 1, refCount: false }));

    const requestResponse$ = request$.pipe(
      switchMap((request) => this.hqService.getQuotesV1(request)),
    );

    const refreshResponse$ = this.refreshSubject.pipe(
      switchMap(() => requestResponse$),
    );

    const response$ = merge(requestResponse$, refreshResponse$).pipe(
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.quotes$ = response$.pipe(
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

  refresh() {
    this.refreshSubject.next();
  }
}
