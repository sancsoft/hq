import { PsrListSearchFilterComponent } from './../psr-list-search-filter/psr-list-search-filter.component';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SortColumn } from '../../models/PSR/get-PSR-v1';
import { SortDirection } from '../../models/common/sort-direction';
import { HQService } from '../../services/hq.service';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from '../../common/paginator/paginator.component';
import { SortIconComponent } from '../../common/sort-icon/sort-icon.component';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { PsrListService } from './psrList.service';
import { ProjectStatus } from '../../enums/project-status';
import { Period } from '../../enums/period';
import { ProjectType } from '../../enums/project-type';
import { CoreModule } from '../../core/core.module';
import { BaseListService } from '../../core/services/base-list.service';

@Component({
  selector: 'hq-psrlist',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    ReactiveFormsModule,
    PaginatorComponent,
    SortIconComponent,
    PsrListSearchFilterComponent,
    CoreModule,
  ],
  providers: [
    {
      provide: BaseListService,
      useExisting: PsrListService,
    },
  ],
  templateUrl: './psrlist.component.html',
})
export class PSRListComponent implements OnInit {
  apiErrors: string[] = [];
  sortOption$: BehaviorSubject<SortColumn>;
  sortDirection$: BehaviorSubject<SortDirection>;

  Math = Math;
  sortColumn = SortColumn;
  sortDirection = SortDirection;
  ProjectStatus = ProjectStatus;
  ProjectType = ProjectType;

  async ngOnInit() {
    await this.listService.initStaffId();
  }

  constructor(
    private hqService: HQService,
    private route: ActivatedRoute,
    public listService: PsrListService,
    private oidcSecurityService: OidcSecurityService,
  ) {
    this.sortOption$ = new BehaviorSubject<SortColumn>(SortColumn.ChargeCode);
    this.sortDirection$ = new BehaviorSubject<SortDirection>(SortDirection.Asc);
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
  getProjectSatusString(status: ProjectStatus): string {
    return ProjectStatus[status];
  }

  getPeriodName(period: Period) {
    return Period[period];
  }
}
