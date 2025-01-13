import { APIError } from './../../errors/apierror';
import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  defer,
  finalize,
  map,
  merge,
  Observable,
  of,
  shareReplay,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { formControlChanges } from '../functions/form-control-changes';
import { PagedResponseV1 } from '../../models/common/paged-response-v1';
import { SortDirection } from '../../models/common/sort-direction';
import { DataSource } from '@angular/cdk/collections';

@Injectable({
  providedIn: 'root',
})
export abstract class BaseListService<
  TResponse extends PagedResponseV1<TRecord>,
  TRecord,
  TSort,
> extends DataSource<TRecord> {
  // Enums
  SortDirection = SortDirection;

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
  public itemsPerPage = new FormControl(15, { nonNullable: true });
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
    super();
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
    this.response$ = merge(response$, refreshResponse$).pipe(
      catchError((error) => {
        return of({
          error:
            error instanceof APIError
              ? error.message
              : 'An unknown error occurred',
        } as unknown as TResponse);
      }),
      finalize(() => this.loadingSubject.next(false)),
      shareReplay({ bufferSize: 1, refCount: false }),
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

  override connect() {
    return this.records$;
  }

  override disconnect() {}

  goToPage(page: number) {
    this.page.setValue(page);
  }

  onSortClick(sortColumn: TSort) {
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
    this.goToPage(1);
  }

  refresh() {
    this.refreshSubject.next();
  }
}
