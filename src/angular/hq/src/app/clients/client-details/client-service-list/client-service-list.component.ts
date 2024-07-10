import { SortIconComponent } from './../../../common/sort-icon/sort-icon.component';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  BehaviorSubject,
  Observable,
  map,
  startWith,
  combineLatest,
  switchMap,
  debounceTime,
  shareReplay,
  tap,
} from 'rxjs';
import { HQService } from '../../../services/hq.service';
import { GetServicesRecordV1 } from '../../../models/Services/get-services-v1';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from '../../../common/paginator/paginator.component';
import { SortColumn } from '../../../models/Services/get-services-v1';
import { SortDirection } from '../../../models/common/sort-direction';
import { HQRole } from '../../../enums/hqrole';
import { InRolePipe } from '../../../pipes/in-role.pipe';
import { ProjectStatus } from '../../../enums/project-status';
import { ClientDetailsService } from '../client-details.service';

@Component({
  selector: 'hq-client-service-list',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    PaginatorComponent,
    ReactiveFormsModule,
    SortIconComponent,
    InRolePipe,
  ],
  templateUrl: './client-service-list.component.html',
})
export class ClientServiceListComponent {
  clientId?: string;
  apiErrors: string[] = [];

  services$: Observable<GetServicesRecordV1[]>;
  skipDisplay$: Observable<number>;
  takeToDisplay$: Observable<number>;
  totalRecords$: Observable<number>;
  sortOption$: BehaviorSubject<SortColumn>;
  sortDirection$: BehaviorSubject<SortDirection>;

  itemsPerPage = new FormControl(20, { nonNullable: true });
  page = new FormControl<number>(1, { nonNullable: true });

  sortColumn = SortColumn;
  sortDirection = SortDirection;
  HQRole = HQRole;

  constructor(
    private hqService: HQService,
    private route: ActivatedRoute,
    public clientDetailService: ClientDetailsService,
  ) {
    this.sortOption$ = new BehaviorSubject<SortColumn>(SortColumn.chargeCode);
    this.sortDirection$ = new BehaviorSubject<SortDirection>(SortDirection.Asc);
    const itemsPerPage$ = this.itemsPerPage.valueChanges.pipe(
      startWith(this.itemsPerPage.value),
    );
    const page$ = this.page.valueChanges.pipe(startWith(this.page.value));

    const skip$ = combineLatest([itemsPerPage$, page$]).pipe(
      map(([itemsPerPage, page]) => (page - 1) * itemsPerPage),
      startWith(0),
    );
    const search$ = clientDetailService.search.valueChanges.pipe(
      tap(() => this.goToPage(1)),
      startWith(clientDetailService.search.value),
    );

    this.skipDisplay$ = skip$.pipe(map((skip) => skip + 1));

    const request$ = combineLatest({
      search: search$,
      skip: skip$,
      take: itemsPerPage$,
      sortBy: this.sortOption$,
      sortDirection: this.sortDirection$,
      clientId: clientDetailService.clientId$,
    });

    const response$ = request$.pipe(
      debounceTime(500),
      switchMap((request) => this.hqService.getServicesV1(request)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.services$ = response$.pipe(
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

    this.clientDetailService.resetFilters();
    this.clientDetailService.hideProjectStatus();
  }

  goToPage(page: number) {
    this.page.setValue(page);
  }

  getProjectStatusString(status: ProjectStatus): string {
    return ProjectStatus[status];
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
    this.page.setValue(1);
  }
}
