import { Injectable } from '@angular/core';
import { BaseListService } from '../../core/services/base-list.service';
import {
  combineLatest,
  debounceTime,
  map,
  Observable,
  shareReplay,
  switchMap,
  tap,
  BehaviorSubject,
  filter,
  distinctUntilChanged,
  catchError,
  of,
} from 'rxjs';
import { SortDirection } from '../../models/common/sort-direction';
import { HQService } from '../../services/hq.service';
import {
  GetTimeRecordsV1,
  GetTimeRecordV1,
  SortColumn,
} from '../../models/times/get-time-v1';
import { GetInvoiceDetailsRecordV1 } from '../../models/Invoices/get-invoice-details-v1';
import { GetClientRecordV1 } from '../../models/clients/get-client-v1';
import { GetChargeCodeRecordV1 } from '../../models/charge-codes/get-chargecodes-v1';

@Injectable({
  providedIn: 'root',
})
export class InvoiceTimeListService extends BaseListService<
  GetTimeRecordsV1,
  GetTimeRecordV1,
  SortColumn
> {
  invoiced$ = new BehaviorSubject<boolean | null>(null);
  public invoiceIdSubject = new BehaviorSubject<string | null>(null);

  invoiceId$ = this.invoiceIdSubject.asObservable().pipe(
    filter((id): id is string => !!id),
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  clientId$: Observable<string>;
  invoice$: Observable<GetInvoiceDetailsRecordV1>;
  client$: Observable<GetClientRecordV1>;
  chargeCodes$: Observable<GetChargeCodeRecordV1[]>;

  constructor(private hqService: HQService) {
    super(SortColumn.Date, SortDirection.Desc);

    this.invoice$ = this.invoiceId$.pipe(
      switchMap((invoiceId) =>
        this.hqService
          .getInvoiceDetailsV1({ id: invoiceId })
          .pipe(
            catchError(() => of(null as unknown as GetInvoiceDetailsRecordV1)),
          ),
      ),
      filter((inv): inv is GetInvoiceDetailsRecordV1 => inv !== null),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.clientId$ = this.invoice$.pipe(map((invoice) => invoice.clientId));

    this.client$ = this.clientId$.pipe(
      switchMap((clientId) => this.hqService.getClientsV1({ id: clientId })),
      map((t) => t.records[0]),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.chargeCodes$ = this.clientId$.pipe(
      switchMap((clientId) =>
        this.hqService.getChargeCodeseV1({ clientId: clientId }),
      ),
      map((t) => t.records),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
  }

  setInvoiced(value: boolean | null) {
    this.invoiced$.next(value);
    this.goToPage(1);
  }

  protected override getResponse(): Observable<GetTimeRecordsV1> {
    const effectiveInvoiceId$ = combineLatest([
      this.invoiced$,
      this.invoiceId$,
    ]).pipe(map(([invoiced, id]) => (invoiced ? id : null)));

    return combineLatest({
      search: this.search$,
      skip: this.skip$,
      take: this.itemsPerPage$,
      sortBy: this.sortOption$,
      sortDirection: this.sortDirection$,
      invoiceId: effectiveInvoiceId$,
      invoiced: this.invoiced$,
    }).pipe(
      debounceTime(500),
      tap(() => this.loadingSubject.next(true)),
      switchMap((request) => this.hqService.getTimesV1(request)),
      tap(() => this.loadingSubject.next(false)),
    );
  }
}
