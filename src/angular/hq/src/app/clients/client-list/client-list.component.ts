import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HQService } from '../../services/hq.service';
import { SortColumn } from '../../models/clients/get-client-v1';
import { SortDirection } from '../../models/common/sort-direction';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from '../../common/paginator/paginator.component';
import { SortIconComponent } from '../../common/sort-icon/sort-icon.component';
import { HQRole } from '../../enums/hqrole';
import { InRolePipe } from '../../pipes/in-role.pipe';
import { ClientListService } from './client-list.service';
import { CoreModule } from '../../core/core.module';
import { BaseListService } from '../../core/services/base-list.service';

export interface ClientNameId {
  id: string;
  name: string;
}

@Component({
  selector: 'hq-client-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    PaginatorComponent,
    SortIconComponent,
    InRolePipe,
    CoreModule,
  ],
  providers: [
    {
      provide: BaseListService,
      useExisting: ClientListService,
    },
  ],
  templateUrl: './client-list.component.html',
})
export class ClientListComponent {
  HQRole = HQRole;

  sortColumn = SortColumn;
  sortDirection = SortDirection;

  constructor(
    public hqService: HQService,
    public listService: ClientListService,
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
}
