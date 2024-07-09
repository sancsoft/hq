import { PsrListSearchFilterComponent } from './../psr-list-search-filter/psr-list-search-filter.component';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  Observable,
  BehaviorSubject,
  startWith,
  combineLatest,
  map,
  tap,
  debounceTime,
  switchMap,
  shareReplay,
  firstValueFrom,
} from 'rxjs';
import { ProjectStatus } from '../../clients/client-details.service';
import { GetPSRRecordV1, SortColumn } from '../../models/PSR/get-PSR-v1';
import { SortDirection } from '../../models/common/sort-direction';
import { HQService } from '../../services/hq.service';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from '../../common/paginator/paginator.component';
import { SortIconComponent } from '../../common/sort-icon/sort-icon.component';
import { Period } from '../../projects/project-create/project-create.component';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { PsrListService } from './services/pstlistService';

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
  ],
  templateUrl: './psrlist.component.html',
})
export class PSRListComponent implements OnInit {
  apiErrors: string[] = [];

  skipDisplay$: Observable<number>;
  takeToDisplay$: Observable<number>;
  totalRecords$: Observable<number>;
  projectStatusReports$: Observable<GetPSRRecordV1[]>;
  sortOption$: BehaviorSubject<SortColumn>;
  sortDirection$: BehaviorSubject<SortDirection>;

  Math = Math;
  sortColumn = SortColumn;
  sortDirection = SortDirection;
  ProjectStatus = ProjectStatus;

  async ngOnInit() {
    this.psrListService.showSearch();
    this.psrListService.showStaffMembers();
    this.psrListService.showIsSubmitted();
    this.psrListService.showStartDate();
    this.psrListService.showEndDate();

    const staffId = await firstValueFrom(
      this.oidcSecurityService.userData$.pipe(map((t) => t.userData?.staff_id)),
    );
    if (staffId) {
      this.psrListService.staffMember.setValue(staffId);
    } else {
      console.log('ERROR: Could not find staff');
    }
  }

  constructor(
    private hqService: HQService,
    private route: ActivatedRoute,
    public psrListService: PsrListService,
    private oidcSecurityService: OidcSecurityService,
  ) {
    this.sortOption$ = new BehaviorSubject<SortColumn>(SortColumn.ChargeCode);
    this.sortDirection$ = new BehaviorSubject<SortDirection>(SortDirection.Asc);

    const itemsPerPage$ = psrListService.itemsPerPage.valueChanges.pipe(
      startWith(psrListService.itemsPerPage.value),
    );
    const page$ = psrListService.page.valueChanges.pipe(
      startWith(psrListService.page.value),
    );

    const skip$ = combineLatest([itemsPerPage$, page$]).pipe(
      map(([itemsPerPage, page]) => (page - 1) * itemsPerPage),
      startWith(0),
    );
    const search$ = psrListService.search.valueChanges.pipe(
      tap(() => this.goToPage(1)),
      startWith(psrListService.search.value),
    );

    this.skipDisplay$ = skip$.pipe(map((skip) => skip + 1));

    const staffMemberId$ = psrListService.staffMember.valueChanges.pipe(
      startWith(psrListService.staffMember.value),
    );

    const isSubmitted$ = psrListService.isSubmitted.valueChanges.pipe(
      startWith(psrListService.isSubmitted.value),
    );
    const startDate$ = psrListService.startDate.valueChanges.pipe(
      startWith(psrListService.startDate.value),
      map((date) => date || null),
    );
    const endDate$ = psrListService.endDate.valueChanges.pipe(
      startWith(psrListService.endDate.value),
      map((date) => date || null),
    );

    const request$ = combineLatest({
      search: search$,
      skip: skip$,
      take: itemsPerPage$,
      sortBy: this.sortOption$,
      projectManagerId: staffMemberId$,
      sortDirection: this.sortDirection$,
      isSubmitted: isSubmitted$,
      startDate: startDate$ ?? null,
      endDate: endDate$ ?? null,
    });

    const response$ = request$.pipe(
      debounceTime(500),
      switchMap((request) => this.hqService.getPSRV1(request)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.projectStatusReports$ = response$.pipe(
      map((response) => {
        return response.records;
      }),
    );

    this.totalRecords$ = response$.pipe(map((t) => t.total!));

    this.takeToDisplay$ = combineLatest([
      skip$,
      itemsPerPage$,
      this.totalRecords$,
    ]).pipe(
      map(([skip, itemsPerPage, totalRecords]) =>
        Math.min(skip + itemsPerPage, totalRecords),
      ),
    );
  }

  goToPage(page: number) {
    this.psrListService.page.setValue(page);
  }

  onSortClick(sortColumn: SortColumn) {
    if (this.sortOption$.value == sortColumn) {
      this.sortDirection$.next(
        this.sortDirection$.value == SortDirection.Asc
          ? SortDirection.Desc
          : SortDirection.Asc,
      );
    } else {
      this.sortOption$.next(sortColumn);
      this.sortDirection$.next(SortDirection.Asc);
    }
    this.psrListService.page.setValue(1);
  }
  getProjectSatusString(status: ProjectStatus): string {
    return ProjectStatus[status];
  }

  getPeriodName(period: Period) {
    return Period[period];
  }
}
