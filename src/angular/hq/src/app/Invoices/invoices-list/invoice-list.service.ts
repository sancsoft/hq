import { Injectable } from '@angular/core';
import { BaseListService } from '../../core/services/base-list.service';
import { SortDirection } from '../../models/common/sort-direction';
import { HQService } from '../../services/hq.service';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  Observable,
  ReplaySubject,
  startWith,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import {
  GetInvoicesRecordV1,
  GetInvoicesResponseV1,
  SortColumn,
} from '../../models/Invoices/get-invoices-v1';
import { FormControl } from '@angular/forms';
import { enumToArrayObservable } from '../../core/functions/enum-to-array';
import { Period } from '../../enums/period';

@Injectable({
  providedIn: 'root',
})
export class InvoiceListService extends BaseListService<
  GetInvoicesResponseV1,
  GetInvoicesRecordV1,
  SortColumn
> {
  public invoicePeriodEnum$ = enumToArrayObservable(Period);

  Period = Period;

  selectedPeriod = new FormControl<Period>(Period.LastMonth);
  startDate = new FormControl<Date | null>(null);
  endDate = new FormControl<Date | null>(null);

  showStartDate$ = new BehaviorSubject<boolean>(false);
  showEndDate$ = new BehaviorSubject<boolean>(false);
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private hqService: HQService) {
    super(SortColumn.ClientName, SortDirection.Asc);

    this.showStartDate$.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (showStart) => {
        if (!showStart) {
          this.startDate.setValue(null);
        }
      },
      error: console.error,
    });
    this.showEndDate$.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (showEnd) => {
        if (!showEnd) {
          this.endDate.setValue(null);
        }
      },
      error: console.error,
    });
  }

  showStartDate() {
    this.showStartDate$.next(true);
  }
  hideStartDate() {
    this.showStartDate$.next(false);
  }

  showEndDate() {
    this.showEndDate$.next(true);
  }
  hideEndDate() {
    this.showEndDate$.next(false);
  }

  protected override getResponse(): Observable<GetInvoicesResponseV1> {
    const period$ = this.selectedPeriod.valueChanges.pipe(
      startWith(this.selectedPeriod.value),
    );
    const startDate$ = this.startDate.valueChanges.pipe(
      startWith(this.startDate.value),
    );
    const endDate$ = this.endDate.valueChanges.pipe(
      startWith(this.endDate.value),
    );
    return combineLatest({
      search: this.search$,
      skip: this.skip$,
      take: this.itemsPerPage$,
      sortBy: this.sortOption$,
      sortDirection: this.sortDirection$,
      period: period$,
      startDate: startDate$,
      endDate: endDate$,
    }).pipe(
      debounceTime(500),
      tap(() => this.loadingSubject.next(true)),
      switchMap((request) => this.hqService.getInvoicesV1(request)),
      tap(() => this.loadingSubject.next(false)),
    );
  }
}
