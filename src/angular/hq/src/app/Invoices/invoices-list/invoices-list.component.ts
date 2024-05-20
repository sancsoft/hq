import { SortColumn } from './../../models/Invoices/get-invoices-v1';

import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  Observable,
  startWith,
  combineLatest,
  map,
  tap,
  of,
  debounceTime,
  switchMap,
  shareReplay,
} from 'rxjs';

import { CommonModule } from '@angular/common';
import { ClientDetailsService } from '../../clients/client-details.service';
import { PaginatorComponent } from '../../common/paginator/paginator.component';
import { SortDirection } from '../../models/common/sort-direction';
import { GetInvoicesRecordV1 } from '../../models/Invoices/get-invoices-v1';
import { HQService } from '../../services/hq.service';

@Component({
  selector: 'hq-client-list',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, PaginatorComponent],
  templateUrl: './invoices-list.component.html',
})
export class InvoicesListComponent {
  invoices$: Observable<GetInvoicesRecordV1[]>;
  apiErrors: string[] = [];

  itemsPerPage = new FormControl(10, { nonNullable: true });
  page = new FormControl<number>(1, { nonNullable: true });

  skipDisplay$: Observable<number>;
  takeToDisplay$: Observable<number>;
  totalRecords$: Observable<number>;

  constructor(
    private hqService: HQService,
    private route: ActivatedRoute,
    private clientDetailService: ClientDetailsService
  ) {
    console.log(this.route.snapshot);

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
      sortBy: of(SortColumn.ClientName),
      sortDirection: of(SortDirection.Asc),
    });

    const response$ = request$.pipe(
      debounceTime(500),
      switchMap((request) => this.hqService.getInvoicesV1(request)),
      shareReplay(1)
    );

    this.invoices$ = response$.pipe(
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
}
