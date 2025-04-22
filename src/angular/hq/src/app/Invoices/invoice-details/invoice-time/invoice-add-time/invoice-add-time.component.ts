import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { CoreModule } from "../../../../core/core.module";
import { firstValueFrom, map, Observable, shareReplay, Subject, switchMap, takeUntil, tap } from "rxjs";
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
import { roundToNextQuarter } from '../../../../common/functions/round-to-next-quarter';
import { InvoiceTimeSearchFilterComponent } from "../invoice-time-search-filter/invoice-time-search-filter.component";
import { AddTimeToInvoiceRequestV1 } from "../../../../models/times/add-time-to-invoice-v1";
import { ToastService } from "../../../../services/toast.service";
import { ModalService } from "../../../../services/modal.service";

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
    public invoiceDetailsService: InvoiceDetaisService,
    public timeService: TimeListService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private modalService: ModalService
  ) {
    console.log("ADD TIME")
    this.invoiceDetailsService.invoiced$.next(false);
    this.invoiceDetailsService.invoice$.pipe(takeUntil(this.destroy)).subscribe(
      (invoice) => {
        if(invoice){
          this.invoice = invoice;
        }
      });
    this.invoiceDetailsService.client$.subscribe((client) => {
      this.currentClient = client;
    });    
    this.invoiceDetailsService.invoiceRefresh();
    
    this.times$ = this.invoiceDetailsService.records$.pipe(map((r) => {
      let t: InvoiceTimeEntry[] = new Array();
      r.forEach(r => {
        t.push({record: r, selected: this.selectedTimes.has(r.id)});
      })
      return t;
    }), tap((t) => {
      console.log("Time records:", t);
    }),);
  }

  updateTimeSelection(time: GetTimeRecordV1, i: number){
    console.log("time entry", time.id, "checked:", (document.getElementById('time_checkbox_'+time.id) as HTMLInputElement).checked);
    // console.log(time, document.getElementById('time_checkbox_'+time.id))
    let hrs = time.hoursInvoiced ?? time.hoursApproved ?? time.hours;
    console.log("  ", hrs);
    if((document.getElementById('time_checkbox_'+time.id) as HTMLInputElement).checked){
      this.selectedHrs += hrs;
      this.selectedTimes.set(time.id, hrs);
    } else {
      this.selectedHrs -= hrs;
      this.selectedTimes.delete(time.id);
    }
    console.log("Selected times:", this.selectedTimes);
  }

  async updateInvoicedHours(time: GetTimeRecordV1, event: Event) {
    const invoicedHours = (event.target as HTMLInputElement).value;
    const roundedInvoicedHours = roundToNextQuarter(invoicedHours);

    if (!time || invoicedHours == '') {
      await firstValueFrom(
        this.modalService.alert(
          'Error',
          'Please Add a time to your invoiced hours',
        ),
      );
      return;
    }
    const chargecodeId = await firstValueFrom(
      this.invoiceDetailsService.chargeCodes$.pipe(
        map((c) => c.find((x) => x.code == time.chargeCode)?.id),
      ),
    );

    const request = {
      id: time.id,
      hoursInvoiced: roundedInvoicedHours
    };
    //  Call API
    let newTime = await firstValueFrom(this.hqService.upsertTimeHoursInvoicedV1(request));
    if(this.selectedTimes.has(newTime.id)){
      this.selectedTimes.set(newTime.id, newTime.hoursInvoiced);
      let hrsSum = 0;
      this.selectedTimes.forEach((t) => {hrsSum += t; console.log(hrsSum)});
      this.selectedHrs = hrsSum;
    }
    this.toastService.show('Updated', 'Invoiced hours have been updated.');
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

  onSortClick(sortColumn: SortColumn) {
    this.invoiceDetailsService.onSortClick(sortColumn);
  }

  async addToInvoice(){
    if(this.invoice){
      let invoiceId = this.invoice.id;
      this.selectedTimes.forEach(async (hrs, t) => {
        const request: AddTimeToInvoiceRequestV1 = {
          id: t,
          invoiceId: invoiceId,
          hoursInvoiced: hrs
        };
        console.info("Request:");
        console.table(request);
        await firstValueFrom(this.hqService.addTimeToInvoiceV1(request))
      })
      await this.router.navigate(['../'], {
        relativeTo: this.route,
      });
    }
  }

  private destroy = new Subject<void>();

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }
}