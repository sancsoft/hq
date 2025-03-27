import { Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject, filter, map, merge, Observable, ReplaySubject, shareReplay, Subject, switchMap, tap } from "rxjs";
import { HQService } from "../../services/hq.service";
import { GetInvoicesRecordV1 } from "../../models/Invoices/get-invoices-v1";
import { GetClientRecordV1 } from "../../models/clients/get-client-v1";
import { GetChargeCodeRecordV1 } from "../../models/charge-codes/get-chargecodes-v1";
import { GetInvoiceDetailsRecordV1 } from "../../models/Invoices/get-invoice-details-v1";
import { BaseListService } from "../../core/services/base-list.service";
import { GetTimeRecordsV1, GetTimeRecordV1, SortColumn } from "../../models/times/get-time-v1";

@Injectable({
  providedIn: 'root',
})
export class InvoiceDetaisService {
  private refreshSubject = new Subject<void>();
  private invoiceIdSubject$ = new BehaviorSubject<string | null>(null);
  invoiceId$: Observable<string>;
  invoice$: Observable<GetInvoiceDetailsRecordV1>;

  clientId$: Observable<string>;
  client$: Observable<GetClientRecordV1>;

  chargeCodes$: Observable<GetChargeCodeRecordV1[]>;
  // times$: Observable<GetTimeRecordV1[]>;

  constructor(
    private hqService: HQService
  ) {
    const invoiceId$ = this.invoiceIdSubject$.asObservable().pipe(
      filter((invoiceId) => invoiceId != null),
      map((invoiceId) => invoiceId!),
    );
    
    const refreshInvoiceId$ = this.refreshSubject.pipe(
      switchMap(() => this.invoiceId$),
    )

    this.invoiceId$ = merge(invoiceId$, refreshInvoiceId$);

    this.invoice$ = this.invoiceId$.pipe(
      switchMap((invoiceId) => this.hqService.getInvoiceDetailsV1({ id: invoiceId})),
      tap((t) => console.log(t)),
      shareReplay({ bufferSize: 1, refCount: false}),
    );

    this.clientId$ = this.invoice$.pipe(map(invoice => invoice.clientId));

    this.client$ = this.clientId$.pipe(
      switchMap((clientId) => this.hqService.getClientsV1({ id: clientId })),
      map((t) => t.records[0]),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.chargeCodes$ = this.clientId$.pipe(
      switchMap((clientId) => this.hqService.getChargeCodeseV1({ clientId: clientId })),
      map((t) => t.records),
      shareReplay({ bufferSize: 1, refCount: false}),
    );

    // this.times$ = this.invoiceId$.pipe(
    //   switchMap((invoiceId) => this.hqService.getTimesV1({ invoiceId: invoiceId})),
    //   map((t) => t.records),
    //   shareReplay({bufferSize: 1, refCount: false}),
    // );


    
  }

  getInvoiceId() {
    return this.invoiceIdSubject$.getValue();
  }

  setInvoiceId(invoiceId?: string | null) {
    if(invoiceId) {
      this.invoiceIdSubject$.next(invoiceId);
    }
  }

  refresh() {
    this.refreshSubject.next();
  }
}