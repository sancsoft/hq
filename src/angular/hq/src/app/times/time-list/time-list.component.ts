import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap, firstValueFrom, startWith, combineLatest } from 'rxjs';
import { SortColumn } from '../../models/times/get-time-v1';
import { SortDirection } from '../../models/common/sort-direction';
import { HQService } from '../../services/hq.service';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from '../../common/paginator/paginator.component';
import { SortIconComponent } from '../../common/sort-icon/sort-icon.component';
import { TimeListService } from './TimeList.service';
import { TimeSearchFilterComponent } from '../search-filter/time-search-filter/time-search-filter.component';
import saveAs from 'file-saver';
import { ToastService } from '../../services/toast.service';
import { InRolePipe } from '../../pipes/in-role.pipe';
import { HQRole } from '../../enums/hqrole';
import { CoreModule } from '../../core/core.module';
import { BaseListService } from '../../core/services/base-list.service';

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
export class TimeListComponent {
  apiErrors: string[] = [];

  HQRole = HQRole;
  sortColumn = SortColumn;
  sortDirection = SortDirection;

  constructor(
    private hqService: HQService,
    private route: ActivatedRoute,
    public listService: TimeListService,
    private toastService: ToastService,
  ) {}

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

    saveAs(result.file, result.fileName);
  }
}
