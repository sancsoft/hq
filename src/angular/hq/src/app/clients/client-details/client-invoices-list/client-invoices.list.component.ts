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
  BehaviorSubject,
} from 'rxjs';
import { SortColumn } from '../../../models/Invoices/get-invoices-v1';
import { SortDirection } from '../../../models/common/sort-direction';
import { HQService } from '../../../services/hq.service';
import { ClientDetailsService } from '../../client-details.service';
import { GetInvoicesRecordV1 } from '../../../models/Invoices/get-invoices-v1';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from '../../../common/paginator/paginator.component';

@Component({
  selector: 'hq-client-invoices-list',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, PaginatorComponent],
  templateUrl: './client-invoices.component-list.html',
})
export class ClientInvoicesComponent {
  clientId?: string;
  invoices$: Observable<GetInvoicesRecordV1[]>;
  apiErrors: string[] = [];
  sortColumn = SortColumn;
  sortDirection = SortDirection;


  itemsPerPage = new FormControl(10, { nonNullable: true });

  page = new FormControl<number>(1, { nonNullable: true });

  skipDisplay$: Observable<number>;
  takeToDisplay$: Observable<number>;
  totalRecords$: Observable<number>;
  sortOption$: BehaviorSubject<SortColumn>;
  sortDirection$: BehaviorSubject<SortDirection>;

  constructor(
    private hqService: HQService,
    private route: ActivatedRoute,
    private clientDetailService: ClientDetailsService
  ) {
    this.route.paramMap.subscribe((paramMap) => {
      this.clientId = paramMap.get('clientId') || undefined;
      console.log(this.clientId);
    });
    this.sortOption$ = new BehaviorSubject<SortColumn>(SortColumn.ClientName);
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
  onSortClick(sortColumn: SortColumn) {
    if(this.sortOption$.value == sortColumn) {
      this.sortDirection$.next(this.sortDirection$.value == SortDirection.Asc? SortDirection.Desc : SortDirection.Asc);
    } else {
      this.sortOption$.next(sortColumn);
      this.sortDirection$.next(SortDirection.Asc);
    }
    this.page.setValue(1);
  }

}
