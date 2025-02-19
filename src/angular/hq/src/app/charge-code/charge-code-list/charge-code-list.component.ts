import { ChargeCodeListService } from './ChargeCodeList.service';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SortColumn } from '../../models/charge-codes/get-chargecodes-v1';
import { SortDirection } from '../../models/common/sort-direction';
import { HQService } from '../../services/hq.service';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from '../../common/paginator/paginator.component';
import { SortIconComponent } from '../../common/sort-icon/sort-icon.component';
import { HQRole } from '../../enums/hqrole';
import { InRolePipe } from '../../pipes/in-role.pipe';
import { ProjectStatus } from '../../enums/project-status';
import { CoreModule } from '../../core/core.module';
import { BaseListService } from '../../core/services/base-list.service';

@Component({
  selector: 'hq-charge-code-list',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    ReactiveFormsModule,
    PaginatorComponent,
    SortIconComponent,
    InRolePipe,
    CoreModule,
  ],
  providers: [
    {
      provide: BaseListService,
      useExisting: ChargeCodeListService,
    },
  ],
  templateUrl: './charge-code-list.component.html',
})
export class ChargeCodeListComponent {
  apiErrors: string[] = [];

  sortColumn = SortColumn;
  sortDirection = SortDirection;
  HQRole = HQRole;

  constructor(
    private hqService: HQService,
    private route: ActivatedRoute,
    public listService: ChargeCodeListService,
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
  getProjectSatusString(status: ProjectStatus): string {
    return ProjectStatus[status];
  }
}
