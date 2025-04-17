import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { CoreModule } from "../../../../core/core.module";
import { GetInvoicesRecordV1 } from "../../../../models/Invoices/get-invoices-v1";
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
import { SortDirection } from "../../../../models/common/sort-direction";
import { BaseListService } from "../../../../core/services/base-list.service";
import { TimeListService } from "../../../../times/time-list/TimeList.service";
import { HQRole } from "../../../../enums/hqrole";
import { InRolePipe } from "../../../../pipes/in-role.pipe";
import { SearchInputComponent } from "../../../../core/components/search-input/search-input.component";
import { InvoiceTimeSearchFilterComponent } from "../invoice-time-search-filter/invoice-time-search-filter.component";
import { RemoveTimeFromInvoiceRequestV1 } from "../../../../models/times/add-time-to-invoice-v1";
import { HQConfirmationModalService } from "../../../../common/confirmation-modal/services/hq-confirmation-modal-service";
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
    private modalService: HQConfirmationModalService
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
    // this.times$ = this.invoiceDetailsService.invoiceId$.pipe(
    //   takeUntil(this.destroy),
    //   switchMap((invoiceId) => this.hqService.getTimesV1({ invoiceId: invoiceId})),
    //   map((t) => t.records),
    //   tap((t) => console.log(t)),
    //   shareReplay({bufferSize: 1, refCount: false}),
    // );
    this.times$ = this.invoiceDetailsService.records$.pipe(takeUntil(this.destroy), map((r) => r), tap(r => console.log('times:',r)));
  }

  updateTimeSelection(time: GetTimeRecordV1, i: number) {
    console.log("time entry", i, "clicked:");
    console.log("Hours approved:", time.hoursApproved)
    console.log(time)
  }

  async toAddTime() {
    console.log(this.route.toString())
    await this.router.navigate(['add'], {
      relativeTo: this.route,
    });
  }

  async openRemoveTimeModal(id: string) {
    this.modalService.showModal("Are you sure you want to remove this time entry from this invoice?");
    if(await firstValueFrom(this.modalService.performAction$)){
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