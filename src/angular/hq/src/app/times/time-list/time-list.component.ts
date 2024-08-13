import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SortColumn } from '../../models/times/get-time-v1';
import { SortDirection } from '../../models/common/sort-direction';
import { HQService } from '../../services/hq.service';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from '../../common/paginator/paginator.component';
import { SortIconComponent } from '../../common/sort-icon/sort-icon.component';
import { TimeService } from './time-list.service';
import { TimeSearchFilterComponent } from '../search-filter/time-search-filter/time-search-filter.component';
import { InRolePipe } from '../../pipes/in-role.pipe';
import { HQRole } from '../../enums/hqrole';
import { TableComponent } from '../../core/components/table/table.component';
import { SortHeaderComponent } from '../../core/components/sort-header/sort-header.component';
import { CoreModule } from '../../core/core.module';
import { BaseListService } from '../../core/services/base-list.service';
import { firstValueFrom, switchMap } from 'rxjs';
import saveAs from 'file-saver';
import { ToastService } from '../../services/toast.service';

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
    TableComponent,
    SortHeaderComponent,
    CoreModule,
  ],
  providers: [
    {
      provide: BaseListService,
      useExisting: TimeService,
    },
  ],
  templateUrl: './time-list.component.html',
})
export class TimeListComponent {
  HQRole = HQRole;

  sortColumn = SortColumn;
  sortDirection = SortDirection;

  constructor(
    public hqService: HQService,
    public timeService: TimeService,
    private toastService: ToastService,
  ) {}

  goToPage(page: number) {
    this.timeService.page.setValue(page);
  }

  onSortClick(sortColumn: SortColumn) {
    if (this.timeService.sortOption$.value == sortColumn) {
      this.timeService.sortDirection$.next(
        this.timeService.sortDirection$.value == SortDirection.Asc
          ? SortDirection.Desc
          : SortDirection.Asc,
      );
    } else {
      this.timeService.sortOption$.next(sortColumn);
      this.timeService.sortDirection$.next(SortDirection.Asc);
    }

    this.timeService.page.setValue(1);
  }

  async exportTime() {
    const result = await firstValueFrom(
      this.timeService.request$.pipe(
        switchMap((request) => {
          console.log(request);
          return this.hqService.exportTimesV1(request);
        }),
      ),
    );
    if (result.file === null) {
      this.toastService.show('Error', 'Unable to download export.');
      return;
    }
    saveAs(result.file, result.fileName);
  }
}
