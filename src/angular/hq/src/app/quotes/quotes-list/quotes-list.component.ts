import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Observable, debounceTime, switchMap, of, distinctUntilChanged, combineLatest, map, shareReplay, startWith, tap } from 'rxjs';
import { HQService } from '../../services/hq.service';
import { GetQuotesRecordV1, GetQuotesRecordsV1, SortColumn } from '../../models/quotes/get-quotes-v1';
import { SortDirection } from '../../models/common/sort-direction';
import { PaginatorComponent } from '../../common/paginator/paginator.component';

@Component({
  selector: 'hq-quotes-list',
  standalone: true,
  imports: [[CommonModule, ReactiveFormsModule, PaginatorComponent]],
  templateUrl: './quotes-list.component.html'
})
export class QuotesListComponent {
  search = new FormControl('', { nonNullable: true });
  itemsPerPage = new FormControl(10, { nonNullable: true });
  page = new FormControl<number>(1, { nonNullable: true });

  records$: Observable<[GetQuotesRecordV1]>

  skipDisplay$: Observable<number>;
  takeToDisplay$: Observable<number>;
  totalRecords$: Observable<number>;

  constructor(private hqService: HQService) {

    const search$ = this.search.valueChanges.pipe(
      tap(t => this.goToPage(1)),
      startWith(this.search.value)
    );

    const itemsPerPage$ = this.itemsPerPage.valueChanges.pipe(
      tap(t => this.goToPage(1)),
      startWith(this.itemsPerPage.value)
    );

    const page$ = this.page.valueChanges.pipe(
      startWith(this.page.value)
    );

    const skip$ = combineLatest([itemsPerPage$, page$]).pipe(
      map(([itemsPerPage, page]) => (page-1) * itemsPerPage)
    )

    const request$ = combineLatest({
      search: search$,
      skip: skip$,
      take: itemsPerPage$,
      sortBy: of(SortColumn.QuoteName),
      sortDirection: of(SortDirection.Asc)
    });

    const response$ = request$.pipe(
      debounceTime(500),
      switchMap(request => hqService.getQuotesV1(request)),
      shareReplay(1)
    );

    this.records$ = response$.pipe(
      map(t => t.records));

      this.records$.subscribe(t => console.log(t));


    this.totalRecords$ = response$.pipe(
      map(t => t.total!)
    );

    this.skipDisplay$ = skip$.pipe(
      map(skip => skip + 1)
    );

    this.takeToDisplay$ = combineLatest([skip$, itemsPerPage$, this.totalRecords$]).pipe(
      map(([skip, itemsPerPage, totalRecords]) => Math.min(skip + itemsPerPage, totalRecords))
    );
  }
  goToPage(page: number) {
    this.page.setValue(page);
  }

}
