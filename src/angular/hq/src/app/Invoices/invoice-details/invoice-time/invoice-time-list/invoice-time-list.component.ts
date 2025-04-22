import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { CoreModule } from "../../../../core/core.module";
import { AbstractControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors } from "@angular/forms";
import { firstValueFrom, map, Observable, shareReplay, Subject, switchMap, takeUntil, tap } from "rxjs";
import { GetClientRecordV1 } from "../../../../models/clients/get-client-v1";
import { GetChargeCodeRecordV1 } from "../../../../models/charge-codes/get-chargecodes-v1";
import { HQService } from "../../../../services/hq.service";
import { ActivatedRoute, Route, Router, RouterLink } from "@angular/router";
import { InvoiceDetaisService } from "../../../service/invoice-details.service";
import { GetInvoiceDetailsRecordV1 } from "../../../../models/Invoices/get-invoice-details-v1";
import { GetTimeRecordClientsV1, GetTimeRecordV1, SortColumn } from "../../../../models/times/get-time-v1";
import { SortIconComponent } from "../../../../common/sort-icon/sort-icon.component";
import { roundToNextQuarter } from '../../../../common/functions/round-to-next-quarter';
import { SortDirection } from "../../../../models/common/sort-direction";
import { BaseListService } from "../../../../core/services/base-list.service";
import { TimeListService } from "../../../../times/time-list/TimeList.service";
import { HQRole } from "../../../../enums/hqrole";
import { HQConfirmationModalService } from "../../../../common/confirmation-modal/services/hq-confirmation-modal-service";
import { ModalService } from "../../../../services/modal.service";
import { ToastService } from "../../../../services/toast.service";
@Component({
  selector: 'hq-invoice-time-list',
  standalone: true,
  imports: [
    CommonModule,
    CoreModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    {
      provide: BaseListService,
      useExisting: TimeListService
    }
  ],
  templateUrl: './invoice-time-list.component.html',
})
export class InvoiceTimeListComponent {
  sortColumn = SortColumn;
  sortDirection = SortDirection;
  // invoiceId$: Observable<string>;
  // invoice$: Observable<GetInvoicesRecordV1>;
  invoice?: GetInvoiceDetailsRecordV1;

  date: string = Date.now.toString();

  HQRole = HQRole;

  apiErrors: string[] = [];

  times$: Observable<GetTimeRecordV1[]>;
  currentClient?: GetClientRecordV1;
  chargeCodes?: Array<GetChargeCodeRecordV1>;

  selectedTimes: Array<GetTimeRecordV1> = new Array<GetTimeRecordV1>();

  constructor(
    private hqService: HQService,
    public invoiceDetailsService: InvoiceDetaisService,
    private route: ActivatedRoute,
    private router: Router,
    private confirmModalService: HQConfirmationModalService,
    private modalService: ModalService,
    private toastService: ToastService
  ) {
    console.log("LIST TIME")
    this.invoiceDetailsService.invoiced$.next(true);
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
    
    this.times$ = this.invoiceDetailsService.records$.pipe(map((r) => r), tap(r => console.log('times:',r)),);
  }

  updateTimeSelection(time: GetTimeRecordV1, i: number) {
    console.log("time entry", i, "clicked:");
    console.log("Hours approved:", time.hoursApproved)
    console.log(time)
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
    await firstValueFrom(this.hqService.upsertTimeHoursInvoicedV1(request));
    this.toastService.show('Updated', 'Approved hours have been updated.');
    this.invoiceDetailsService.invoiceRefresh();
  }

  onSortClick(sortColumn: SortColumn) {
    this.invoiceDetailsService.onSortClick(sortColumn);
  }

  async toAddTime() {
    console.log(this.route.toString())
    await this.router.navigate(['add'], {
      relativeTo: this.route,
    });
  }

  async openRemoveTimeModal(id: string) {
    this.confirmModalService.showModal("Are you sure you want to remove this time entry from this invoice?");
    if(await firstValueFrom(this.confirmModalService.performAction$)){
      this.removeTime(id);
    }
  }
  async removeTime(id: string) {
    console.warn("Removing", id);
    await firstValueFrom(this.hqService.removeTimeFromInvoiceV1({id: id}));
    this.invoiceDetailsService.invoiceRefresh();
  }

  private destroy = new Subject<void>();

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }
}