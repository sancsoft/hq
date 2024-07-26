import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  BehaviorSubject,
  combineLatest,
  concat,
  defer,
  map,
  Observable,
  shareReplay,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { formControlChanges } from '../functions/form-control-changes';
import { PagedResponseV1 } from '../../models/common/paged-response-v1';
import { SortDirection } from '../../models/common/sort-direction';

@Injectable({
  providedIn: 'root',
})
export abstract class BaseListService<
  TResponse extends PagedResponseV1<TRecord>,
  TRecord,
  TSort,
> {
  // Loading status
  protected loadingSubject = new BehaviorSubject<boolean>(true);
  public loading$ = this.loadingSubject.asObservable();

  // Subjects
  protected refreshSubject = new Subject<void>();

  // Sorting
  public sortOption$: BehaviorSubject<TSort>;
  public sortDirection$: BehaviorSubject<SortDirection>;

  // Filters
  public search = new FormControl<string | null>(null);
  public itemsPerPage = new FormControl(20, { nonNullable: true });
  public page = new FormControl<number>(1, { nonNullable: true });

  public takeToDisplay$: Observable<number>;
  public totalRecords$: Observable<number>;
  public response$: Observable<TResponse>;
  public records$: Observable<TRecord[]>;

  public itemsPerPage$: Observable<number>;
  public page$: Observable<number>;
  public skip$: Observable<number>;
  public skipDisplay$: Observable<number>;

  public search$: Observable<string | null>;

  protected abstract getResponse(): Observable<TResponse>;

  constructor(defaultSortOption: TSort, defaultSortDirection: SortDirection) {
    this.sortOption$ = new BehaviorSubject(defaultSortOption);
    this.sortDirection$ = new BehaviorSubject(defaultSortDirection);

    this.itemsPerPage$ = formControlChanges(this.itemsPerPage).pipe(
      tap(() => this.goToPage(1)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.page$ = formControlChanges(this.page);

    this.skip$ = combineLatest([this.itemsPerPage$, this.page$]).pipe(
      map(([itemsPerPage, page]) => (page - 1) * itemsPerPage),
    );

    this.skipDisplay$ = this.skip$.pipe(map((skip) => skip + 1));

    this.search$ = formControlChanges(this.search).pipe(
      tap(() => this.goToPage(1)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    const response$ = defer(() => this.getResponse());

    const refreshResponse$ = this.refreshSubject.pipe(
      switchMap(() => response$),
    );

    this.response$ = concat(response$, refreshResponse$).pipe(
      tap(() => this.loadingSubject.next(true)),
      shareReplay({ bufferSize: 1, refCount: false }),
      tap(() => this.loadingSubject.next(false)),
    );

    this.records$ = this.response$.pipe(
      map((response) => {
        return response.records;
      }),
    );

    this.totalRecords$ = this.response$.pipe(map((t) => t.total!));

    this.takeToDisplay$ = combineLatest([
      this.skip$,
      this.itemsPerPage$,
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
