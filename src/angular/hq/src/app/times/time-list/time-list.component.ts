import { Component, OnDestroy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  switchMap,
  firstValueFrom,
  startWith,
  combineLatest,
  ReplaySubject,
} from 'rxjs';
import { SortColumn } from '../../models/times/get-time-v1';
import { SortDirection } from '../../models/common/sort-direction';
import { HQService } from '../../services/hq.service';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from '../../common/paginator/paginator.component';
import { SortIconComponent } from '../../common/sort-icon/sort-icon.component';
import { TimeListService } from './TimeList.service';
import { TimeSearchFilterComponent } from '../search-filter/time-search-filter/time-search-filter.component';
import FileSaver from 'file-saver';
import { ToastService } from '../../services/toast.service';
import { InRolePipe } from '../../pipes/in-role.pipe';
import { HQRole } from '../../enums/hqrole';
import { CoreModule } from '../../core/core.module';
import { BaseListService } from '../../core/services/base-list.service';
import { ModalService } from '../../services/modal.service';
import { APIError } from '../../errors/apierror';
import { HttpErrorResponse } from '@angular/common/http';

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
    CoreModule,
  ],
  providers: [
    {
      provide: BaseListService,
      useExisting: TimeListService,
    },
  ],
  templateUrl: './time-list.component.html',
})
export class TimeListComponent implements OnDestroy {
  apiErrors: string[] = [];

  HQRole = HQRole;
  sortColumn = SortColumn;
  sortDirection = SortDirection;
  destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private hqService: HQService,
    private route: ActivatedRoute,
    private router: Router,
    public listService: TimeListService,
    private toastService: ToastService,
    private modalService: ModalService,
  ) {
    this.listService.refresh();
  }
  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  goToPage(page: number) {
    this.listService.page.setValue(page);
  }

  onSortClick(sortColumn: SortColumn) {
    if (this.listService.sortOption$.value == sortColumn) {
      this.listService.sortDirection$.next(
        this.listService.sortDirection$.value == SortDirection.Asc
          ? SortDirection.Desc
          : SortDirection.Asc,
      );
    } else {
      this.listService.sortOption$.next(sortColumn);
      this.listService.sortDirection$.next(SortDirection.Asc);
    }

    this.listService.page.setValue(1);
  }

  async exportTime() {
    const projectId$ = this.listService.project.valueChanges.pipe(
      startWith(this.listService.project.value),
    );
    const staffMemberId$ = this.listService.staffMember.valueChanges.pipe(
      startWith(this.listService.staffMember.value),
    );
    const startDate$ = this.listService.startDate.valueChanges.pipe(
      startWith(this.listService.startDate.value),
    );
    const endDate$ = this.listService.endDate.valueChanges.pipe(
      startWith(this.listService.endDate.value),
    );
    const period$ = this.listService.selectedPeriod.valueChanges.pipe(
      startWith(this.listService.selectedPeriod.value),
    );
    const invoiced$ = this.listService.invoiced.valueChanges.pipe(
      startWith(this.listService.invoiced.value),
    );
    const timeStatus$ = this.listService.timeStatus.valueChanges.pipe(
      startWith(this.listService.timeStatus.value),
    );
    const combinedParams = {
      search: this.listService.search$,
      skip: this.listService.skip$,
      clientId: this.listService.clientId$,
      projectId: projectId$,
      staffId: staffMemberId$,
      take: this.listService.itemsPerPage$,
      sortBy: this.listService.sortOption$,
      startDate: startDate$,
      endDate: endDate$,
      period: period$,
      invoiced: invoiced$,
      timeStatus: timeStatus$,
      sortDirection: this.listService.sortDirection$,
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

  async deleteTime(timeId: string) {
    const request = {
      id: timeId,
    };

    const confirm = await firstValueFrom(
      this.modalService.confirm(
        'Delete',
        'Are you sure you want to delete this time entry?',
      ),
    );

    if (!confirm) {
      return;
    }

    try {
      await firstValueFrom(this.hqService.deleteTimeV1(request));
      this.toastService.show('Success', 'Time entry successfully deleted.');
      this.listService.refresh();
      // this.staffDashboardService.refresh();
    } catch (err) {
      if (err instanceof APIError) {
        this.toastService.show('Error', err.errors.join('\n'));
      } else if (err instanceof HttpErrorResponse && err.status == 403) {
        this.toastService.show(
          'Unauthorized',
          'You are not authorized to delete for this date.',
        );
      } else {
        this.toastService.show('Error', 'An unexpected error has occurred.');
      }
    }
  }
}
