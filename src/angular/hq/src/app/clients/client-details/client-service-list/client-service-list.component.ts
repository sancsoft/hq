import { SortIconComponent } from './../../../common/sort-icon/sort-icon.component';
import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BehaviorSubject, Observable, map, startWith, combineLatest, switchMap, debounceTime, shareReplay, tap } from 'rxjs';
import { HQService } from '../../../services/hq.service';
import { GetServicesRecordV1 } from '../../../models/Services/get-services-v1';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from '../../../common/paginator/paginator.component';
import { ClientDetailsService } from '../../client-details.service';
import { SortColumn } from '../../../models/Services/get-services-v1';
import { SortDirection } from '../../../models/common/sort-direction';
import { QuoteStatus } from '../../../models/quotes/get-quotes-v1';

@Component({
  selector: 'hq-client-service-list',
  standalone: true,
  imports: [RouterLink, CommonModule, PaginatorComponent, ReactiveFormsModule, SortIconComponent],
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


  itemsPerPage = new FormControl(10, { nonNullable: true });
  page = new FormControl<number>(1, { nonNullable: true });

  sortColumn = SortColumn;
  sortDirection = SortDirection;


  constructor(
    private hqService: HQService,
    private route: ActivatedRoute,
    private clientDetailService: ClientDetailsService
  ) {
    const clientId$ = this.route.parent!.params.pipe(map((t) => t['clientId']));

    this.sortOption$ = new BehaviorSubject<SortColumn>(SortColumn.chargeCode);
    this.sortDirection$ = new BehaviorSubject<SortDirection>(SortDirection.Asc);
    const itemsPerPage$ = this.itemsPerPage.valueChanges.pipe(
      startWith(this.itemsPerPage.value)
    );
    const page$ = this.page.valueChanges.pipe(startWith(this.page.value));

    const skip$ = combineLatest([itemsPerPage$, page$]).pipe(
      map(([itemsPerPage, page]) => (page - 1) * itemsPerPage),
      startWith(0)
    );
    const search$ = clientDetailService.search.valueChanges.pipe(
      tap((t) => this.goToPage(1)),
      startWith(clientDetailService.search.value)
    );

    this.skipDisplay$ = skip$.pipe(map((skip) => skip + 1));

    const request$ = combineLatest({
      search: search$,
      skip: skip$,
      take: itemsPerPage$,
      sortBy: this.sortOption$,
      sortDirection: this.sortDirection$,
      clientId: clientId$
    });

    const response$ = request$.pipe(
      debounceTime(500),
      switchMap((request) => this.hqService.getServicesV1(request)),
      shareReplay(1)
    );

    this.services$ = response$.pipe(
      map((response) => {
        return response.records;
      })
    );

    this.totalRecords$ = response$.pipe(map((t) => t.total!));

    this.takeToDisplay$ = combineLatest([
      skip$,
      itemsPerPage$,
      this.totalRecords$,
    ]).pipe(
      map(([skip, itemsPerPage, totalRecords]) =>
        Math.min(skip + itemsPerPage, totalRecords)
      )
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
          : SortDirection.Asc
      );
    } else {
      this.sortOption$.next(sortColumn);
      this.sortDirection$.next(SortDirection.Asc);
    }
    this.page.setValue(1);
  }
}
