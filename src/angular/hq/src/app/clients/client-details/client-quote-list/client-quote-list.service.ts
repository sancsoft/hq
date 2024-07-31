import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  tap,
  shareReplay,
  Observable,
  combineLatest,
  debounceTime,
  switchMap,
} from 'rxjs';
import { formControlChanges } from '../../../core/functions/form-control-changes';
import { BaseListService } from '../../../core/services/base-list.service';
import { ProjectStatus } from '../../../enums/project-status';
import { SortDirection } from '../../../models/common/sort-direction';
import {
  GetQuotesResponseV1,
  GetQuotesRecordV1,
  SortColumn,
} from '../../../models/quotes/get-quotes-v1';
import { HQService } from '../../../services/hq.service';
import { ClientDetailsService } from '../client-details.service';

@Injectable({
  providedIn: 'root',
})
export class ClientQuoteListService extends BaseListService<
  GetQuotesResponseV1,
  GetQuotesRecordV1,
  SortColumn
> {
  // Enums
  public ProjectStatus = ProjectStatus;
  public SortColumn = SortColumn;

  protected override getResponse(): Observable<GetQuotesResponseV1> {
    const search$ = formControlChanges(this.clientDetailsService.search).pipe(
      tap(() => this.goToPage(1)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    const quoteStatus$ = formControlChanges(
      this.clientDetailsService.projectStatus,
    ).pipe(
      tap(() => this.goToPage(1)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    const result$ = combineLatest({
      search: search$,
      clientId: this.clientDetailsService.clientId$,
      skip: this.skip$,
      take: this.itemsPerPage$,
      sortBy: this.sortOption$,
      quoteStatus: quoteStatus$,
      sortDirection: this.sortDirection$,
    }).pipe(
      debounceTime(500),
      tap(() => this.loadingSubject.next(true)),
      switchMap((request) => this.hqService.getQuotesV1(request)),
      tap(() => this.loadingSubject.next(false)),
    );

    return result$;
  }

  constructor(
    private hqService: HQService,
    private clientDetailsService: ClientDetailsService,
  ) {
    super(SortColumn.QuoteNumber, SortDirection.Desc);
  }
}
