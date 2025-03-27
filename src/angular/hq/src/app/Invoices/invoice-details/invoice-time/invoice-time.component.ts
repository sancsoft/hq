import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { CoreModule } from "../../../core/core.module";
import { GetInvoicesRecordV1 } from "../../../models/Invoices/get-invoices-v1";
import { AbstractControl, FormGroup, ValidationErrors } from "@angular/forms";
import { map, Observable, shareReplay, Subject, switchMap, takeUntil, tap } from "rxjs";
import { GetClientRecordV1 } from "../../../models/clients/get-client-v1";
import { GetChargeCodeRecordV1 } from "../../../models/charge-codes/get-chargecodes-v1";
import { HQService } from "../../../services/hq.service";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { InvoiceDetaisService } from "../../service/invoice-details.service";
import { GetInvoiceDetailsRecordV1 } from "../../../models/Invoices/get-invoice-details-v1";
import { GetTimeRecordClientsV1, GetTimeRecordV1, SortColumn } from "../../../models/times/get-time-v1";
import { SortIconComponent } from "../../../common/sort-icon/sort-icon.component";
import { SortDirection } from "../../../models/common/sort-direction";
import { BaseListService } from "../../../core/services/base-list.service";
import { TimeListService } from "../../../times/time-list/TimeList.service";
import { HQRole } from "../../../enums/hqrole";
import { InRolePipe } from "../../../pipes/in-role.pipe";
@Component({
  selector: 'hq-invoice-time-entries',
  standalone: true,
  imports: [
    CommonModule,
    CoreModule,
    RouterLink,
    InRolePipe
  ],
  providers: [
    {
      provide: BaseListService,
      useExisting: TimeListService
    }
  ],
  templateUrl: './invoice-time.component.html',
})
export class InvoiceTimeEntriesComponent {
  sortColumn = SortColumn;
  sortDirection = SortDirection;
  // invoiceId$: Observable<string>;
  // invoice$: Observable<GetInvoicesRecordV1>;
  invoice?: GetInvoiceDetailsRecordV1;

  date: string = Date.now.toString();

  HQRole = HQRole;

  apiErrors: string[] = [];

  times$: Observable<GetTimeRecordV1[]>;
  clients$: Observable<GetClientRecordV1[]>;
  currentClient?: GetClientRecordV1;
  chargeCodes?: Array<GetChargeCodeRecordV1>;

  selectedTimes: Array<GetTimeRecordV1> = new Array<GetTimeRecordV1>();

  constructor(
    private hqService: HQService,
    private invoiceDetailsService: InvoiceDetaisService
  ) {
    this.invoiceDetailsService.invoice$.pipe(takeUntil(this.destroy)).subscribe(
      (invoice) => {
        if(invoice){
          this.invoice = invoice;
        }
      });
    this.clients$ = hqService.getClientsV1({}).pipe(map((t) => t.records));
    this.invoiceDetailsService.client$.subscribe((client) => {
      this.currentClient = client;
    });    
    this.invoiceDetailsService.refresh();
    this.times$ = this.invoiceDetailsService.invoiceId$.pipe(
      takeUntil(this.destroy),
      switchMap((invoiceId) => this.hqService.getTimesV1({ invoiceId: invoiceId})),
      map((t) => t.records),
      tap((t) => console.log(t)),
      shareReplay({bufferSize: 1, refCount: false}),
    );
  }

  updateTimeSelection(time: GetTimeRecordV1, i: number){
    console.log("time entry", i, "clicked:");
    console.log(time)
  }

  private destroy = new Subject<void>();

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }
}