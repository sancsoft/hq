import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CoreModule } from '../../../../core/core.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  combineLatest,
  filter,
  firstValueFrom,
  map,
  Observable,
  Subject,
  switchMap,
  takeUntil,
  distinctUntilChanged, // added
} from 'rxjs';
import { GetChargeCodeRecordV1 } from '../../../../models/charge-codes/get-chargecodes-v1';
import { HQService } from '../../../../services/hq.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  GetTimeRecordV1,
  SortColumn,
} from '../../../../models/times/get-time-v1';
import { roundToNextQuarter } from '../../../../common/functions/round-to-next-quarter';
import { SortDirection } from '../../../../models/common/sort-direction';
import { BaseListService } from '../../../../core/services/base-list.service';
import { HQRole } from '../../../../enums/hqrole';
import { HQConfirmationModalService } from '../../../../common/confirmation-modal/services/hq-confirmation-modal-service';
import { ModalService } from '../../../../services/modal.service';
import { ToastService } from '../../../../services/toast.service';
import {
  HQInvoiceTimeChangeEvent,
  InvoiceNewTimeEntryComponent,
} from '../invoice-new-time-entry/invoice-new-time-entry.component';
import { APIError } from '../../../../errors/apierror';
import { HttpErrorResponse } from '@angular/common/http';
import { CreateInvoicedTimeRequestV1 } from '../../../../models/times/create-invoiced-time-v1';
import { InRolePipe } from '../../../../pipes/in-role.pipe';
import FileSaver from 'file-saver';
import { InvoiceTimeListService } from '../../../service/invoice-time-list.service';

@Component({
  selector: 'hq-invoice-time-list',
  standalone: true,
  imports: [
    CommonModule,
    CoreModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    InvoiceNewTimeEntryComponent,
    InRolePipe,
  ],
  providers: [
    {
      provide: BaseListService,
      useExisting: InvoiceTimeListService,
    },
  ],
  templateUrl: './invoice-time-list.component.html',
})
export class InvoiceTimeListComponent implements OnDestroy, OnInit {
  sortColumn = SortColumn;
  sortDirection = SortDirection;

  date: string = Date.now.toString();

  HQRole = HQRole;

  apiErrors: string[] = [];

  times$: Observable<GetTimeRecordV1[]>;
  chargeCodes?: Array<GetChargeCodeRecordV1>;

  invoiceId: string | null = null;
  selectedTimes: Array<GetTimeRecordV1> = new Array<GetTimeRecordV1>();

  constructor(
    private hqService: HQService,
    public invoiceTimeListService: InvoiceTimeListService,
    private route: ActivatedRoute,
    private router: Router,
    private confirmModalService: HQConfirmationModalService,
    private modalService: ModalService,
    private toastService: ToastService,
  ) {
    this.invoiceTimeListService.invoiced$.next(true);

    this.times$ = this.invoiceTimeListService.records$.pipe(map((r) => r));
  }

  async ngOnInit() {
    const invoiceRoute = this.route.parent?.parent;
    invoiceRoute?.paramMap
      .pipe(
        map((pm) => pm.get('invoiceId')),
        filter((id): id is string => !!id),
        distinctUntilChanged(),
        takeUntil(this.destroy),
      )
      .subscribe({
        next: (id) => {
          this.invoiceId = id;
          console.log(id);
          this.invoiceTimeListService.invoiceIdSubject.next(id);
          this.invoiceTimeListService.refresh();
        },
        error: console.error,
      });
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

    const request = {
      id: time.id,
      hoursInvoiced: roundedInvoicedHours,
    };
    //  Call API
    await firstValueFrom(this.hqService.upsertTimeHoursInvoicedV1(request));
    this.toastService.show('Updated', 'Approved hours have been updated.');
    this.invoiceTimeListService.refresh();
  }

  async upsertTime(event: HQInvoiceTimeChangeEvent) {
    if (!event.date) {
      return;
    }

    const request: Partial<CreateInvoicedTimeRequestV1> = {
      staffId: event.staffId?.toString(),
      id: event.id,
      hours: event.hours,
      invoiceId: this.invoiceId,
      hoursInvoiced: event.invoicedHours,
      chargeCodeId: event.chargeCodeId,
      task: event.task,
      activityId: event.activityId,
      notes: event.notes,
      date: event.date,
    };

    try {
      await firstValueFrom(this.hqService.createInvoicedTimeV1(request));

      if (event.id) {
        this.toastService.show('Success', 'Time entry successfully updated.');
        this.invoiceTimeListService.refresh();
        // this.planningPointsRequestTrigger$.next(); // TODO: Trigger this
      } else {
        this.toastService.show('Success', 'Time entry successfully created.');
        this.invoiceTimeListService.refresh();
        // this.planningPointsRequestTrigger$.next();
      }
    } catch (err) {
      if (err instanceof APIError) {
        this.toastService.show('Error', err.errors.join('\n'));
      } else if (err instanceof HttpErrorResponse && err.status == 403) {
        this.toastService.show(
          'Unauthorized',
          'You are not authorized to create or modify time for this date.',
        );
      } else {
        this.toastService.show('Error', 'An unexpected error has occurred.');
      }
    }
  }

  async toAddTime() {
    await this.router.navigate(['add'], {
      relativeTo: this.route,
    });
  }

  async openRemoveTimeModal(id: string) {
    this.confirmModalService.showModal(
      'Are you sure you want to remove this time entry from this invoice?',
    );
    if (
      (await firstValueFrom(this.confirmModalService.performAction$)) === true
    ) {
      await this.removeTime(id);
    }
  }

  async removeTime(id: string) {
    await firstValueFrom(this.hqService.removeTimeFromInvoiceV1({ id: id }));
    this.invoiceTimeListService.refresh();
  }

  async exportTime() {
    const combinedParams = {
      search: this.invoiceTimeListService.search$,
      skip: this.invoiceTimeListService.skip$,
      invoiceId: this.invoiceTimeListService.invoiceId$,
      // clientId: this.invoiceTimeListService.clientId$,
      take: this.invoiceTimeListService.itemsPerPage$,
      sortBy: this.invoiceTimeListService.sortOption$,
      sortDirection: this.invoiceTimeListService.sortDirection$,
    };
    const result = await firstValueFrom(
      combineLatest(combinedParams).pipe(
        switchMap((request) => this.hqService.exportTimesV1(request)),
      ),
    );

    if (result.file === null) {
      this.toastService.show('Error', 'Unable to download export.');
      return;
    }

    FileSaver.saveAs(result.file, result.fileName);
  }

  private destroy = new Subject<void>();

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }
}
