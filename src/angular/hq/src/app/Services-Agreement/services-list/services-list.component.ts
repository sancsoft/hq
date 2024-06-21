import { ClientDetailsSearchFilterComponent } from './../../clients/client-details/client-details-search-filter/client-details-search-filter.component';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  Observable,
  BehaviorSubject,
  map,
  startWith,
  combineLatest,
  tap,
  debounceTime,
  switchMap,
  shareReplay,
} from 'rxjs';
import { ClientDetailsService } from '../../clients/client-details.service';
import { GetServicesRecordV1 } from '../../models/Services/get-services-v1';
import { SortColumn } from '../../models/Services/get-services-v1';
import { SortDirection } from '../../models/common/sort-direction';
import { HQService } from '../../services/hq.service';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from '../../common/paginator/paginator.component';
import { SortIconComponent } from '../../common/sort-icon/sort-icon.component';
import { QuoteStatus } from '../../models/common/quote-status';
import { HQRole } from '../../enums/hqrole';
import { InRolePipe } from '../../pipes/in-role.pipe';

@Component({
  selector: 'hq-services-list',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    PaginatorComponent,
    ReactiveFormsModule,
    SortIconComponent,
    ClientDetailsSearchFilterComponent,
    InRolePipe,
  ],
  templateUrl: './services-list.component.html',
})
export class ServicesListComponent {
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
    private clientDetailService: ClientDetailsService,
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
      tap((t) => this.goToPage(1)),
      startWith(clientDetailService.search.value),
    );

    this.skipDisplay$ = skip$.pipe(map((skip) => skip + 1));

    const request$ = combineLatest({
      search: search$,
      skip: skip$,
      take: itemsPerPage$,
      sortBy: this.sortOption$,
      sortDirection: this.sortDirection$,
    });

    const response$ = request$.pipe(
      debounceTime(500),
      switchMap((request) => this.hqService.getServicesV1(request)),
      shareReplay(1),
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
    this.clientDetailService.hideCurrentOnly();
  }

  goToPage(page: number) {
    this.page.setValue(page);
  }

  getQuoteStatusString(status: QuoteStatus): string {
    return QuoteStatus[status];
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
