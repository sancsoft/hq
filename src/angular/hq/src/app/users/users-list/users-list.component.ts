import { SortColumn } from './../../models/staff-members/get-staff-member-v1';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ClientDetailsSearchFilterComponent } from '../../clients/client-details/client-details-search-filter/client-details-search-filter.component';
import { PaginatorComponent } from '../../common/paginator/paginator.component';
import { SortIconComponent } from '../../common/sort-icon/sort-icon.component';

import { SortDirection } from '../../models/common/sort-direction';
import { HQService } from '../../services/hq.service';
import { CoreModule } from '../../core/core.module';
import { UserListService } from './user-list.service';
import { BaseListService } from '../../core/services/base-list.service';
import { TableComponent } from '../../core/components/table/table.component';

@Component({
  selector: 'hq-users-list',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    ReactiveFormsModule,
    PaginatorComponent,
    SortIconComponent,
    ClientDetailsSearchFilterComponent,
    RouterLink,
    CoreModule,
    TableComponent,
    ReactiveFormsModule,
    FormsModule,
  ],
  providers: [
    {
      provide: BaseListService,
      useExisting: UserListService,
    },
  ],

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
