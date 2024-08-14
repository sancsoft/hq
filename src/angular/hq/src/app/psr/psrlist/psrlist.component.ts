import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, firstValueFrom } from 'rxjs';
import { SortColumn } from '../../models/PSR/get-PSR-v1';
import { SortDirection } from '../../models/common/sort-direction';
import { HQService } from '../../services/hq.service';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from '../../common/paginator/paginator.component';
import { SortIconComponent } from '../../common/sort-icon/sort-icon.component';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { PsrListService } from './psr-list.service';
import { ProjectStatus } from '../../enums/project-status';
import { Period } from '../../enums/period';
import { ProjectType } from '../../enums/project-type';
import { SortHeaderComponent } from '../../core/components/sort-header/sort-header.component';
import { TableComponent } from '../../core/components/table/table.component';
import { InRolePipe } from '../../pipes/in-role.pipe';
import { BaseListService } from '../../core/services/base-list.service';
import { CoreModule } from '../../core/core.module';

@Component({
  selector: 'hq-psrlist',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    ReactiveFormsModule,
    PaginatorComponent,
    SortIconComponent,
    InRolePipe,
    TableComponent,
    SortHeaderComponent,
    ReactiveFormsModule,
    FormsModule,
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
  Math = Math;
  sortColumn = SortColumn;
  sortDirection = SortDirection;
  ProjectStatus = ProjectStatus;
  ProjectType = ProjectType;

  async ngOnInit() {
    // this.psrListService.showSearch();
    // this.psrListService.showStaffMembers();
    // this.psrListService.showIsSubmitted();

    const staffId = await firstValueFrom(
      this.oidcSecurityService.userData$.pipe(map((t) => t.userData?.staff_id)),
    );
    if (staffId) {
      this.listService.staffMember.setValue(staffId);
    } else {
      console.log('ERROR: Could not find staff');
    }
  }

  constructor(
    private hqService: HQService,
    private route: ActivatedRoute,
    public listService: PsrListService,
    private oidcSecurityService: OidcSecurityService,
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

  getPeriodName(period: Period) {
    return Period[period];
  }
  showHideDates() {
    if (this.listService.selectedPeriod.value == Period.Custom) {
      this.listService.showStartDate();
      this.listService.showEndDate();
    } else {
      this.listService.hideStartDate();
      this.listService.hideEndDate();
      this.listService.startDate.reset();
      this.listService.endDate.reset();
    }
  }
}
