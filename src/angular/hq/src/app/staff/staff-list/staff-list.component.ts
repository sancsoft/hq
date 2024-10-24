import { SortColumn } from './../../models/staff-members/get-staff-member-v1';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { SortDirection } from '../../models/common/sort-direction';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from '../../common/paginator/paginator.component';
import { SortIconComponent } from '../../common/sort-icon/sort-icon.component';
import { HQRole } from '../../enums/hqrole';
import { InRolePipe } from '../../pipes/in-role.pipe';
import { Jurisdiciton } from '../../enums/jurisdiciton';
import { StaffListService } from './staff-list.service';
import { StaffListSearchFilterComponent } from '../staff-list-search-filter/staff-list-search-filter.component';
import { CoreModule } from '../../core/core.module';
import { BaseListService } from '../../core/services/base-list.service';

@Component({
  selector: 'hq-staff-list',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    ReactiveFormsModule,
    PaginatorComponent,
    SortIconComponent,
    RouterLink,
    InRolePipe,
    StaffListSearchFilterComponent,
    CoreModule,
  ],
  providers: [
    {
      provide: BaseListService,
      useExisting: StaffListService,
    },
  ],
  templateUrl: './staff-list.component.html',
})
export class StaffListComponent {
  apiErrors: string[] = [];
  Jurisdiction = Jurisdiciton;
  sortColumn = SortColumn;
  sortDirection = SortDirection;
  HQRole = HQRole;

  constructor(public listService: StaffListService) {}
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
