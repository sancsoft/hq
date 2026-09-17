import { CommonModule } from '@angular/common';
import { Component, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CoreModule } from '../../../../core/core.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  combineLatest,
  firstValueFrom,
  map,
  Observable,
  Subject,
  switchMap,
  takeUntil,
  BehaviorSubject,
} from 'rxjs';
import { GetClientRecordV1 } from '../../../../models/clients/get-client-v1';
import { GetChargeCodeRecordV1 } from '../../../../models/charge-codes/get-chargecodes-v1';
import { HQService } from '../../../../services/hq.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InvoiceDetaisService } from '../../../service/invoice-details.service';
import { GetInvoiceDetailsRecordV1 } from '../../../../models/Invoices/get-invoice-details-v1';
import {
  GetTimeRecordV1,
  SortColumn,
} from '../../../../models/times/get-time-v1';
import { roundToNextQuarter } from '../../../../common/functions/round-to-next-quarter';
import { SortDirection } from '../../../../models/common/sort-direction';
import { BaseListService } from '../../../../core/services/base-list.service';
import { TimeListService } from '../../../../times/time-list/TimeList.service';
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

@Component({
  selector: 'hq-invoice-time-list',
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
      useExisting: TimeListService,
    },
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './invoice-time-list.component.html',
})
export class InvoiceTimeListComponent implements OnDestroy {
  sortColumn = SortColumn;
  sortDirection = SortDirection;

  date: string = Date.now.toString();

  HQRole = HQRole;

  apiErrors: string[] = [];

  invoice$: Observable<GetInvoiceDetailsRecordV1>;
  times$: Observable<GetTimeRecordV1[]>;
  currentClient$: Observable<GetClientRecordV1>;
  chargeCodes?: Array<GetChargeCodeRecordV1>;

  invoiceId: string | null = null;

  private selectionTrigger$ = new BehaviorSubject<void>(undefined);
  isAllChecked$: Observable<boolean>;
  selectedTimes: Map<string, number> = new Map<string, number>();
  deleteBtnDisabled: boolean = true;

  constructor(
    private hqService: HQService,
    public invoiceDetailsService: InvoiceDetaisService,
    private route: ActivatedRoute,
    private router: Router,
    private confirmModalService: HQConfirmationModalService,
    private modalService: ModalService,
    private toastService: ToastService,
  ) {
    this.invoiceDetailsService.invoiced$.next(true);
    this.invoiceDetailsService.sortOption$.next(SortColumn.Date);
    this.invoiceDetailsService.sortDirection$.next(SortDirection.Desc);
    this.invoiceDetailsService.search.setValue(null);
    this.invoiceDetailsService.project.setValue(null);
    this.invoiceDetailsService.projectActivity.setValue(null);
    this.invoiceDetailsService.staffMember.setValue(null);
    this.invoiceDetailsService.startDate.setValue(null);
    this.invoiceDetailsService.endDate.setValue(null);
    this.invoiceDetailsService.timeStatus.setValue(null);
    this.invoiceDetailsService.billable.setValue(null);
    this.invoiceDetailsService.selectedPeriod.setValue(2);
    this.invoiceDetailsService.refresh();

    this.invoice$ = this.invoiceDetailsService.invoice$.pipe(
      map((invoice) => {
        this.invoiceId = invoice.id;
        return invoice;
      }),
      takeUntil(this.destroy),
    );
    this.currentClient$ = this.invoiceDetailsService.client$.pipe(
      map((client) => client),
      takeUntil(this.destroy),
    );

    this.times$ = this.invoiceDetailsService.records$.pipe(map((r) => r));

    this.isAllChecked$ = combineLatest([
      this.times$,
      this.selectionTrigger$,
    ]).pipe(
      map(([entries]) => {
        if (Array.isArray(entries) && entries.length > 0) {
          return entries.every((time) => this.isChecked(time.id));
        }
        return false;
      }),
    );
  }

  async updateInvoicedHours(time: GetTimeRecordV1, event: Event) {
    const inputInvoicedHours = event.target as HTMLInputElement;
    const invoicedHours = (event.target as HTMLInputElement).value;
    let roundedInvoicedHours = roundToNextQuarter(invoicedHours);
    const numInvoicedHours = parseFloat(invoicedHours);

    if (!time || invoicedHours == '' || numInvoicedHours < 0) {
      await firstValueFrom(
        this.modalService.alert(
          'Error',
          'Please Add a time to your invoiced hours',
        ),
      );

      inputInvoicedHours.value = '0';
      roundedInvoicedHours = 0;

      inputInvoicedHours.classList.remove('border-black');
      inputInvoicedHours.classList.add(
        'rounded-none',
        'border-red-700',
        'focus:border-red-700',
        'focus:outline-none',
      );

      inputInvoicedHours.select();
    } else {
      inputInvoicedHours.classList.add('border-black');
      inputInvoicedHours.classList.remove(
        'rounded-none',
        'border-red-700',
        'focus:border-red-700',
        'focus:outline-none',
      );
    }

    const request = {
      id: time.id,
      hoursInvoiced: roundedInvoicedHours,
    };
    const currentInvoicedHours = time.hoursInvoiced ?? 0;

    await firstValueFrom(this.hqService.upsertTimeHoursInvoicedV1(request));
    time.hoursInvoiced = roundedInvoicedHours;
    const invoice = await firstValueFrom(this.invoiceDetailsService.invoice$);
    if (invoice) {
      this.invoiceDetailsService.patchInvoice({
        invoicedHours:
          invoice.invoicedHours + (roundedInvoicedHours - currentInvoicedHours),
      });
    }
    this.toastService.show('Updated', 'Approved hours have been updated.');
  }

  onSortClick(sortColumn: SortColumn) {
    this.invoiceDetailsService.onSortClick(sortColumn);
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
        this.invoiceDetailsService.refresh();
        this.invoiceDetailsService.invoiceRefresh();
        // this.planningPointsRequestTrigger$.next(); // TODO: Trigger this
      } else {
        this.toastService.show('Success', 'Time entry successfully created.');
        this.invoiceDetailsService.refresh();
        this.invoiceDetailsService.invoiceRefresh();
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
    try {
      const confirmed = await firstValueFrom(
        this.modalService.confirm(
          'Confirmation',
          'Are you sure you want to remove this time entry from this invoice?',
        ),
      );

      if (confirmed) {
        await this.removeTime(id);
      }
    } catch (error) {
      console.error('Modal confirmation error:', error);
    }
  }

  async removeTime(id: string) {
    await firstValueFrom(this.hqService.removeTimeFromInvoiceV1({ id: id }));
    this.invoiceDetailsService.invoiceRefresh();
  }

  async exportTime() {
    const combinedParams = {
      search: this.invoiceDetailsService.search$,
      skip: this.invoiceDetailsService.skip$,
      invoiceId: this.invoiceDetailsService.invoiceId$,
      clientId: this.invoiceDetailsService.clientId$,
      take: this.invoiceDetailsService.itemsPerPage$,
      sortBy: this.invoiceDetailsService.sortOption$,
      sortDirection: this.invoiceDetailsService.sortDirection$,
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

  isChecked(id: string) {
    return this.selectedTimes.has(id);
  }

  toggleAllEntries(event: Event): void {
    const shouldSelectAll = (event.target as HTMLInputElement).checked;

    firstValueFrom(this.times$)
      .then((entries) => {
        if (!Array.isArray(entries)) return;

        entries.forEach((time) => {
          if (shouldSelectAll) {
            this.selectedTimes.set(time.id, 1);
          } else {
            this.selectedTimes.delete(time.id);
          }
        });

        this.deleteBtnDisabled = this.selectedTimes.size < 1;
        this.selectionTrigger$.next();
      })
      .catch((err: unknown) => {
        console.error('Failed to resolve times stream:', err);
      });
  }

  updateTimeSelection(time: GetTimeRecordV1) {
    if (
      (document.getElementById('time_checkbox_' + time.id) as HTMLInputElement)
        .checked
    ) {
      this.selectedTimes.set(time.id, 1);
      this.deleteBtnDisabled = false;
    } else {
      this.selectedTimes.delete(time.id);
      if (this.selectedTimes.size < 1) {
        this.deleteBtnDisabled = true;
      }
    }
    this.selectionTrigger$.next();
  }

  async deleteFromInvoice() {
    if (this.selectedTimes.size === 0) return;

    try {
      const confirmed = await firstValueFrom(
        this.modalService.confirm(
          'Confirmation',
          `Are you sure you want to remove ${this.selectedTimes.size} time entr${this.selectedTimes.size === 1 ? 'y' : 'ies'} from this invoice?`,
        ),
      );

      if (confirmed) {
        const timeIds = Array.from(this.selectedTimes.keys());
        await Promise.all(timeIds.map((id) => this.removeTime(id)));
        this.selectedTimes.clear();
        this.deleteBtnDisabled = true;
        this.selectionTrigger$.next();
      }
    } catch (error) {
      console.error('Modal confirmation error:', error);
    }
  }

  private destroy = new Subject<void>();

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }
}
