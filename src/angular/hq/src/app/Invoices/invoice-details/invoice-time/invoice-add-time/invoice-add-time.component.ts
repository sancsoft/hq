import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { CoreModule } from "../../../../core/core.module";
import { GetInvoicesRecordV1 } from "../../../../models/Invoices/get-invoices-v1";
import { AbstractControl, FormGroup, ValidationErrors } from "@angular/forms";
import { map, Observable, shareReplay, Subject, switchMap, takeUntil, tap } from "rxjs";
import { GetClientRecordV1 } from "../../../../models/clients/get-client-v1";
import { GetChargeCodeRecordV1 } from "../../../../models/charge-codes/get-chargecodes-v1";
import { HQService } from "../../../../services/hq.service";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { InvoiceDetaisService } from "../../../service/invoice-details.service";
import { GetInvoiceDetailsRecordV1 } from "../../../../models/Invoices/get-invoice-details-v1";
import { GetTimeRecordClientsV1, GetTimeRecordV1, SortColumn } from "../../../../models/times/get-time-v1";
import { SortIconComponent } from "../../../../common/sort-icon/sort-icon.component";
import { SortDirection } from "../../../../models/common/sort-direction";
import { BaseListService } from "../../../../core/services/base-list.service";
import { TimeListService } from "../../../../times/time-list/TimeList.service";
import { HQRole } from "../../../../enums/hqrole";
import { InRolePipe } from "../../../../pipes/in-role.pipe";
import { SearchInputComponent } from "../../../../core/components/search-input/search-input.component";
import { SelectInputComponent } from "../../../../core/components/select-input/select-input.component";
import { TimeSearchFilterComponent } from "../../../../times/search-filter/time-search-filter/time-search-filter.component";
import { InvoiceTimeSearchFilterComponent } from "../invoice-time-search-filter/invoice-time-search-filter.component";

interface InvoiceTimeEntry {
  record: GetTimeRecordV1,
  selected: boolean
}

@Component({
  selector: 'hq-invoice-add-time',
  standalone: true,
  imports: [
    CommonModule,
    CoreModule,
    RouterLink,
    InRolePipe,
    SelectInputComponent,
    TimeSearchFilterComponent,
    InvoiceTimeSearchFilterComponent
],
  providers: [
    {
      provide: BaseListService,
      useExisting: TimeListService
    }
  ],
  templateUrl: './invoice-add-time.component.html',
})
export class InvoiceAddTimeComponent {
  sortColumn = SortColumn;
  sortDirection = SortDirection;
  // invoiceId$: Observable<string>;
  // invoice$: Observable<GetInvoicesRecordV1>;
  invoice?: GetInvoiceDetailsRecordV1;

  date: string = Date.now.toString();

  HQRole = HQRole;

  apiErrors: string[] = [];

  times$: Observable<InvoiceTimeEntry[]>;
  // clients$: Observable<GetClientRecordV1[]>;
  currentClient?: GetClientRecordV1;
  chargeCodes?: Array<GetChargeCodeRecordV1>;

  selectedTimes: Map<string, number> = new Map<string, number>();
  selectedHrs: number = 0;

  constructor(
    private hqService: HQService,
    private invoiceDetailsService: InvoiceDetaisService,
    public timeService: TimeListService
  ) {
    console.log("ADD TIME")
    this.invoiceDetailsService.invoiced$.next(false);
    this.invoiceDetailsService.invoice$.pipe(takeUntil(this.destroy)).subscribe(
      (invoice) => {
        if(invoice){
          this.invoice = invoice;
        }
      });
    // this.clients$ = hqService.getClientsV1({}).pipe(map((t) => t.records));
    this.invoiceDetailsService.client$.subscribe((client) => {
      this.currentClient = client;
    });    
    this.invoiceDetailsService.invoiceRefresh();
    // this.times$ = this.invoiceDetailsService.client$.pipe(
    //   takeUntil(this.destroy),
    //   switchMap((client) => this.hqService.getTimesV1({ clientId: client.id})),
    //   map((t) => t.records),
    //   tap((t) => console.log(t)),
    //   shareReplay({bufferSize: 1, refCount: false}),
    // );
    // this.times$ = this.timeService.records$.pipe(map((t) => t), tap((t) => console.log(t)));
    this.times$ = this.invoiceDetailsService.records$.pipe(map((r) => {
      let t: InvoiceTimeEntry[] = new Array();
      r.forEach(r => {
        t.push({record: r, selected: this.selectedTimes.has(r.id)});
      })
      return t;
    }), tap((t) => {
      console.log("Time records:", t);
    }),);
    // this.invoiceDetailsService.response$.pipe(takeUntil(this.destroy), map(r => r.records.flatMap((t) => t.id))).subscribe((r) => {
    //   this.refreshTimeSelection2(r);
    // });
  }

  updateTimeSelection(time: GetTimeRecordV1, i: number){
    console.log("time entry", time.id, "checked:", (document.getElementById('time_checkbox_'+time.id) as HTMLInputElement).checked);
    console.log("  ", time.hoursApproved);
    // console.log(time, document.getElementById('time_checkbox_'+time.id))
    if((document.getElementById('time_checkbox_'+time.id) as HTMLInputElement).checked){
      this.selectedHrs += time.hours;
      this.selectedTimes.set(time.id, time.hours);
    } else {
      this.selectedHrs -= time.hours;
      this.selectedTimes.delete(time.id);
    }
    console.log("Selected times:", this.selectedTimes);
  }

  // keeps catching status of the elements from before they've been reloaded
  refreshTimeSelection(){
    console.log("refreshing ", this.selectedTimes.size, " elements")
    this.selectedTimes.forEach((hrs: number, id: string) => {
      console.log(id, hrs);
      let timeCheckbox = document.getElementById('time_checkbox_'+id) as HTMLInputElement;
      if(timeCheckbox == null){
        this.selectedTimes.delete(id);
        this.selectedHrs -= hrs;
        console.log("goodbye")
      } else if(timeCheckbox.checked){
        console.log("still here and checked")
      }
    })
  }

  refreshTimeSelection2(records: Array<string>){
    // console.log(records, "in refresh")
    // maybe check record ids ^ with selectedTimes map keys for discrepancies? 
    console.log("Selected times:", this.selectedTimes);
    this.selectedTimes.forEach((hrs, id) => {
      if(records.find(r => r == id) == null){
        console.log(id," filtered out")
        // this.selectedHrs -= this.selectedTimes.get(id)?? 0;
        // this.selectedTimes.delete(id);
      }
    })
  }

  isChecked(id: string){
    return this.selectedTimes.has(id);
  }

  private destroy = new Subject<void>();

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }
}