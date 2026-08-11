import { SortColumn } from './../../models/staff-members/get-staff-member-v1';
import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { SortDirection } from '../../models/common/sort-direction';
import { HQService } from '../../services/hq.service';
import { CoreModule } from '../../core/core.module';
import { UserListService } from './user-list.service';
import { BaseListService } from '../../core/services/base-list.service';
import { TableComponent } from '../../core/components/table/table.component';

@Component({
  selector: 'hq-users-list',
  imports: [
    RouterLink,
    CommonModule,
    ReactiveFormsModule,
    CoreModule,
    TableComponent,
    FormsModule,
  ],
  providers: [
    {
      provide: BaseListService,
      useExisting: UserListService,
    },
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './users-list.component.html',
})
export class UsersListComponent {
  sortColumn = SortColumn;
  sortDirection = SortDirection;

  constructor(
    public hqService: HQService,
    public listService: UserListService,
  ) {
    this.listService.refresh();
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
}
