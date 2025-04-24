import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { CoreModule } from "../../../../core/core.module";
import { catchError, first, firstValueFrom, map, Observable, shareReplay, Subject, switchMap, take, takeUntil, takeWhile, tap } from "rxjs";
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
import { AddTimesToInvoiceRequestV1, AddTimeToInvoiceRequestV1 } from "../../../../models/times/add-time-to-invoice-v1";
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
  invoice?: GetInvoiceDetailsRecordV1;

  date: string = Date.now.toString();

  HQRole = HQRole;

  apiErrors: string[] = [];

  times$: Observable<InvoiceTimeEntry[]>;
  currentClient?: GetClientRecordV1;
  chargeCodes?: Array<GetChargeCodeRecordV1>;

  selectedTimes: Map<string, number> = new Map<string, number>();
  selectedHrs: number = 0;
  addBtnDisabled: boolean = true;

  constructor(
    private hqService: HQService,
    public invoiceDetailsService: InvoiceDetaisService,
    public timeService: TimeListService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private modalService: ModalService
  ) {
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
    
    this.times$ = this.invoiceDetailsService.records$.pipe(map((r) => {
      let t: InvoiceTimeEntry[] = new Array();
      r.forEach(r => {
        t.push({record: r, selected: this.selectedTimes.has(r.id)});
      })

      this.selectedTimes.forEach((hrs, id) => {
        if(!t.find(el => el.record.id == id)){
          this.selectedHrs -= hrs;
          this.selectedTimes.delete(id);
        }
        if(this.selectedTimes.size < 1){
          this.addBtnDisabled = true;
        }
      })

      return t;
    })
    );
  }

  updateTimeSelection(time: GetTimeRecordV1, i: number){
    let hrs = time.hoursInvoiced ?? time.hoursApproved ?? time.hours;
    if((document.getElementById('time_checkbox_'+time.id) as HTMLInputElement).checked){
      this.selectedHrs += hrs;
      this.selectedTimes.set(time.id, hrs);
      this.addBtnDisabled = false;
    } else {
      this.selectedHrs -= hrs;
      this.selectedTimes.delete(time.id);
      if(this.selectedTimes.size < 1){
        this.addBtnDisabled = true;
      }
    }
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

  isChecked(id: string){
    return this.selectedTimes.has(id);
  }

  onSortClick(sortColumn: SortColumn) {
    this.invoiceDetailsService.onSortClick(sortColumn);
  }

  async addToInvoice(){
    if(this.invoice){
      var request: AddTimesToInvoiceRequestV1 = {
        invoiceId: this.invoice.id,
        timeEntries: new Array<Partial<AddTimeToInvoiceRequestV1>>
      };
      request.invoiceId = this.invoice.id;
      this.selectedTimes.forEach((hrs, t) => {
        request.timeEntries.push({
          id: t,
          hoursInvoiced: hrs
        });
      });
      this.hqService.addTimesToInvoiceV1(request).subscribe({
        next: async () => {
          await this.router.navigate(['../'], {
            relativeTo: this.route,
          })
        },
        error: async (err) => {
          this.toastService.show("Error", "An unexpected error occurred.");
          this.invoiceDetailsService.invoiceRefresh();
        }
      });
    }
  }

  private destroy = new Subject<void>();

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }
}