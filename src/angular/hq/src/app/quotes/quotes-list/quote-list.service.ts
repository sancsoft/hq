import { Injectable } from '@angular/core';
import { ProjectStatus } from '../../enums/project-status';
import { FormControl } from '@angular/forms';
import {
  combineLatest,
  debounceTime,
  Observable,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';
import { HQService } from '../../services/hq.service';
import { SortDirection } from '../../models/common/sort-direction';
import {
  GetQuotesRecordV1,
  GetQuotesResponseV1,
  SortColumn,
} from '../../models/quotes/get-quotes-v1';
import { formControlChanges } from '../../core/functions/form-control-changes';
import { BaseListService } from '../../core/services/base-list.service';

@Injectable({
  providedIn: 'root',
})
export class QuoteListService extends BaseListService<
  GetQuotesResponseV1,
  GetQuotesRecordV1,
  SortColumn
> {
  // Enums
  public ProjectStatus = ProjectStatus;

  // Filters
  public quoteStatus = new FormControl<ProjectStatus | null>(null);
  public quoteStatus$ = formControlChanges(this.quoteStatus).pipe(
    tap(() => this.goToPage(1)),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  protected override getResponse(): Observable<GetQuotesResponseV1> {
    return combineLatest({
      search: this.search$,
      skip: this.skip$,
      take: this.itemsPerPage$,
      sortBy: this.sortOption$,
      quoteStatus: this.quoteStatus$,
      sortDirection: this.sortDirection$,
    }).pipe(
      debounceTime(500),
      tap(() => this.loadingSubject.next(true)),
      switchMap((request) => this.hqService.getQuotesV1(request)),
      tap(() => this.loadingSubject.next(false)),
    );
  }

  constructor(private hqService: HQService) {
    super(SortColumn.QuoteNumber, SortDirection.Desc);
  }
}
