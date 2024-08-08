import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  Observable,
  BehaviorSubject,
  startWith,
  combineLatest,
  map,
  tap,
  debounceTime,
  switchMap,
  shareReplay,
  firstValueFrom,
} from 'rxjs';
import {
  GetTimeRecordV1,
  GetTimeRequestV1,
  SortColumn,
} from '../../models/times/get-time-v1';
import { SortDirection } from '../../models/common/sort-direction';
import { HQService } from '../../services/hq.service';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from '../../common/paginator/paginator.component';
import { SortIconComponent } from '../../common/sort-icon/sort-icon.component';
import { TimeService } from '../services/TimeService';
import { TimeSearchFilterComponent } from '../search-filter/time-search-filter/time-search-filter.component';
import { saveAs } from 'file-saver';
import { ToastService } from '../../services/toast.service';
import { InRolePipe } from '../../pipes/in-role.pipe';
import { HQRole } from '../../enums/hqrole';

@Component({
  selector: 'hq-time-list',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    ReactiveFormsModule,
    PaginatorComponent,
    SortIconComponent,
    TimeSearchFilterComponent,
    InRolePipe,
  ],
  templateUrl: './time-list.component.html',
})
export class TimeListComponent {
  apiErrors: string[] = [];

  skipDisplay$: Observable<number>;
  takeToDisplay$: Observable<number>;
  billableHours$: Observable<number>;
  TotalHours$: Observable<number>;
  AcceptedHours$: Observable<number>;
  AcceptedBillableHours$: Observable<number>;
  totalRecords$: Observable<number>;
  times$: Observable<GetTimeRecordV1[]>;
  sortOption$: BehaviorSubject<SortColumn>;
  sortDirection$: BehaviorSubject<SortDirection>;
  date$ = new BehaviorSubject<Date | null>(null);

  HQRole = HQRole;
  sortColumn = SortColumn;
  sortDirection = SortDirection;
  timeRequest$: Observable<Partial<GetTimeRequestV1>>;

  constructor(
    private hqService: HQService,
    private route: ActivatedRoute,
    public timeListService: TimeService,
    private toastService: ToastService,
  ) {
    this.sortOption$ = new BehaviorSubject<SortColumn>(SortColumn.Date);
    this.sortDirection$ = new BehaviorSubject<SortDirection>(
      SortDirection.Desc,
    );

    const itemsPerPage$ = this.timeListService.itemsPerPage.valueChanges.pipe(
      startWith(this.timeListService.itemsPerPage.value),
    );
    const page$ = this.timeListService.page.valueChanges.pipe(
      startWith(this.timeListService.page.value),
    );

    const skip$ = combineLatest([itemsPerPage$, page$]).pipe(
      map(([itemsPerPage, page]) => (page - 1) * itemsPerPage),
      startWith(0),
    );
    const search$ = timeListService.search.valueChanges.pipe(
      tap(() => this.goToPage(1)),
      startWith(timeListService.search.value),
    );

    this.skipDisplay$ = skip$.pipe(map((skip) => skip + 1));

    const staffMemberId$ = this.timeListService.staffMember.valueChanges.pipe(
      startWith(this.timeListService.staffMember.value),
    );

    const projectId$ = this.timeListService.project.valueChanges.pipe(
      startWith(this.timeListService.project.value),
    );
    const startDate$ = this.timeListService.startDate.valueChanges.pipe(
      startWith(this.timeListService.startDate.value),
      tap(() => {
        this.date$.next(null);
      }),
    );
    const endDate$ = this.timeListService.endDate.valueChanges.pipe(
      startWith(this.timeListService.endDate.value),
      tap(() => {
        this.date$.next(null);
      }),
    );
    const period$ = this.timeListService.selectedPeriod.valueChanges.pipe(
      startWith(this.timeListService.selectedPeriod.value),
      tap(() => {
        //
        this.date$.next(new Date());
      }),
    );
    const invoiced$ = this.timeListService.invoiced.valueChanges.pipe(
      startWith(this.timeListService.invoiced.value),
    );
    const timeStatus$ = this.timeListService.timeStatus.valueChanges.pipe(
      startWith(this.timeListService.timeStatus.value),
    );

    this.timeRequest$ = combineLatest({
      search: search$,
      skip: skip$,
      // date: this.date$,
      clientId: this.timeListService.clientId$,
      projectId: projectId$,
      staffId: staffMemberId$,
      take: itemsPerPage$,
      sortBy: this.sortOption$,
      startDate: startDate$,
      endDate: endDate$,
      period: period$,
      invoiced: invoiced$,
      timeStatus: timeStatus$,
      sortDirection: this.sortDirection$,
    }).pipe(shareReplay({ bufferSize: 1, refCount: false }));

    const response$ = this.timeRequest$.pipe(
      debounceTime(500),
      switchMap((request) => this.hqService.getTimesV1(request)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.times$ = response$.pipe(
      map((response) => {
        return response.records;
      }),
    );

    this.totalRecords$ = response$.pipe(map((t) => t.total!));
    this.billableHours$ = response$.pipe(map((t) => t.billableHours!));
    this.TotalHours$ = response$.pipe(map((t) => t.totalHours!));
    this.AcceptedHours$ = response$.pipe(map((t) => t.acceptedHours!));
    this.AcceptedBillableHours$ = response$.pipe(
      map((t) => t.acceptedBillableHours!),
    );
    this.takeToDisplay$ = combineLatest([
      skip$,
      itemsPerPage$,
      this.totalRecords$,
    ]).pipe(
      map(([skip, itemsPerPage, totalRecords]) =>
        Math.min(skip + itemsPerPage, totalRecords),
      ),
    );
  }

  goToPage(page: number) {
    this.timeListService.page.setValue(page);
  }

  onSortClick(sortColumn: SortColumn) {
    if (this.sortOption$.value == sortColumn) {
      this.sortDirection$.next(
        this.sortDirection$.value == SortDirection.Asc
          ? SortDirection.Desc
          : SortDirection.Asc,
      );
    } else {
      this.sortOption$.next(sortColumn);
      this.sortDirection$.next(SortDirection.Asc);
    }
    this.timeListService.page.setValue(1);
  }

  async exportTime() {
    const result = await firstValueFrom(
      this.timeRequest$.pipe(
        switchMap((request) => this.hqService.exportTimesV1(request)),
      ),
    );

    if (result.file === null) {
      this.toastService.show('Error', 'Unable to download export.');
      return;
    }

    await saveAs(result.file, result.fileName);
  }
}
