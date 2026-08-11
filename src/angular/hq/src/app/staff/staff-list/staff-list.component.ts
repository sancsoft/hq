import { SortColumn } from './../../models/staff-members/get-staff-member-v1';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { SortDirection } from '../../models/common/sort-direction';
import { CommonModule } from '@angular/common';
import { HQRole } from '../../enums/hqrole';
import { Jurisdiciton } from '../../enums/jurisdiciton';
import { StaffListService } from './staff-list.service';
import { StaffListSearchFilterComponent } from '../staff-list-search-filter/staff-list-search-filter.component';
import { CoreModule } from '../../core/core.module';
import { BaseListService } from '../../core/services/base-list.service';

@Component({
  selector: 'hq-staff-list',
  imports: [
    RouterLink,
    CommonModule,
    ReactiveFormsModule,
    StaffListSearchFilterComponent,
    CoreModule,
  ],
  providers: [
    {
      provide: BaseListService,
      useExisting: StaffListService,
    },
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
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
