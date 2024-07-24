import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  Observable,
  debounceTime,
  switchMap,
  combineLatest,
  map,
  shareReplay,
  startWith,
  tap,
  BehaviorSubject,
  firstValueFrom,
} from 'rxjs';
import { HQService } from '../../services/hq.service';
import {
  GetQuotesRecordV1,
  SortColumn,
} from '../../models/quotes/get-quotes-v1';
import { SortDirection } from '../../models/common/sort-direction';
import { PaginatorComponent } from '../../common/paginator/paginator.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ClientDetailsServiceToReplace } from '../../clients/client-details.service';
import { SortIconComponent } from '../../common/sort-icon/sort-icon.component';
import { ClientDetailsSearchFilterComponent } from '../../clients/client-details/client-details-search-filter/client-details-search-filter.component';
import { HQRole } from '../../enums/hqrole';
import { InRolePipe } from '../../pipes/in-role.pipe';
import { ProjectStatus } from '../../enums/project-status';
import { CoreModule } from '../../core/core.module';
import saveAs from 'file-saver';

@Component({
  selector: 'hq-quotes-list',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    ReactiveFormsModule,
    PaginatorComponent,
    SortIconComponent,
    ClientDetailsSearchFilterComponent,
    InRolePipe,
    CoreModule,
  ],
  templateUrl: './quotes-list.component.html',
})
export class QuotesListComponent {
  apiErrors: string[] = [];

  quotes$: Observable<GetQuotesRecordV1[]>;
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
    private clientDetailService: ClientDetailsServiceToReplace,
  ) {
    this.sortOption$ = new BehaviorSubject<SortColumn>(SortColumn.QuoteNumber);
    this.sortDirection$ = new BehaviorSubject<SortDirection>(
      SortDirection.Desc,
    );

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
    });

    const response$ = request$.pipe(
      debounceTime(500),
      switchMap((request) => this.hqService.getQuotesV1(request)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.quotes$ = response$.pipe(
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
  getProjectStatusString(status: ProjectStatus): string {
    return ProjectStatus[status];
  }

  async getPdf(id: string) {
    const result = await firstValueFrom(this.hqService.getQuotePDFV1({ id }));
    if (result.file === null) {
      return;
    }

    saveAs(result.file, result.fileName);
  }
}
