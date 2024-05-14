import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HQService } from '../../services/hq.service';
import { GetClientRecordV1, SortColumn } from '../../models/clients/get-client-v1';
import { SortDirection } from '../../models/common/sort-direction';
import { FormControl, FormControlDirective, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, combineLatest, debounceTime, map, of, shareReplay, startWith, switchMap, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from '../../common/paginator/paginator.component';

@Component({
  selector: 'hq-client-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, PaginatorComponent],
  templateUrl: './client-list.component.html'
})
export class ClientListComponent {

  search = new FormControl('', { nonNullable: true });
  itemsPerPage = new FormControl(10, { nonNullable: true });
  page = new FormControl<number>(1, { nonNullable: true });

  records$: Observable<GetClientRecordV1[]>

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
      sortBy: of(SortColumn.Name),
      sortDirection: of(SortDirection.Asc)
    });

    const response$ = request$.pipe(
      debounceTime(500),
      switchMap(request => hqService.getClientsV1(request)),
      shareReplay(1)
    );

    this.records$ = response$.pipe(
      map(t => t.records)
    );

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
