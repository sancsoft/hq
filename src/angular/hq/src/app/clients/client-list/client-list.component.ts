import { ClientListService } from './../Services/ClientListService';
import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HQService } from '../../services/hq.service';
import {
  GetClientRecordV1,
  SortColumn,
} from '../../models/clients/get-client-v1';
import { SortDirection } from '../../models/common/sort-direction';
import { ReactiveFormsModule } from '@angular/forms';
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  debounceTime,
  map,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from '../../common/paginator/paginator.component';
import { SortIconComponent } from '../../common/sort-icon/sort-icon.component';
import { SearchFilterClientListComponent } from '../SearchFilter/search-filter-client-list/search-filter-client-list.component';
import { HQRole } from '../../enums/hqrole';
import { InRolePipe } from '../../pipes/in-role.pipe';

export interface ClientNameId {
  id: string;
  name: string;
}

@Component({
  selector: 'hq-client-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    PaginatorComponent,
    SortIconComponent,
    SearchFilterClientListComponent,
    InRolePipe,
  ],
  templateUrl: './client-list.component.html',
})
export class ClientListComponent {
  @Output() selectedClient = new EventEmitter<GetClientRecordV1>();

  HQRole = HQRole;

  records$: Observable<GetClientRecordV1[]>;
  skipDisplay$: Observable<number>;
  takeToDisplay$: Observable<number>;
  totalRecords$: Observable<number>;
  sortOption$: BehaviorSubject<SortColumn>;
  sortDirection$: BehaviorSubject<SortDirection>;

  sortColumn = SortColumn;
  sortDirection = SortDirection;
  private currentClient$ = new BehaviorSubject<GetClientRecordV1 | null>(null);

  constructor(
    public hqService: HQService,
    public ClientListService: ClientListService,
  ) {
    this.sortOption$ = new BehaviorSubject<SortColumn>(SortColumn.Name);
    this.sortDirection$ = new BehaviorSubject<SortDirection>(SortDirection.Asc);
    const search$ = this.ClientListService.search.valueChanges.pipe(
      tap(() => this.goToPage(1)),
      startWith(this.ClientListService.search.value),
    );

    const itemsPerPage$ = this.ClientListService.itemsPerPage.valueChanges.pipe(
      tap(() => this.goToPage(1)),
      startWith(this.ClientListService.itemsPerPage.value),
    );

    const page$ = this.ClientListService.page.valueChanges.pipe(
      startWith(this.ClientListService.page.value),
    );

    const skip$ = combineLatest([itemsPerPage$, page$]).pipe(
      map(([itemsPerPage, page]) => (page - 1) * itemsPerPage),
    );

    const request$ = combineLatest({
      search: search$,
      skip: skip$,
      take: itemsPerPage$,
      sortBy: this.sortOption$,
      sortDirection: this.sortDirection$,
    });

    const response$ = request$.pipe(
      debounceTime(500),
      switchMap((request) => hqService.getClientsV1(request)),
      shareReplay(1),
    );

    this.records$ = response$.pipe(map((t) => t.records));

    this.totalRecords$ = response$.pipe(map((t) => t.total!));

    this.skipDisplay$ = skip$.pipe(map((skip) => skip + 1));

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
    this.ClientListService.page.setValue(page);
  }
  toggleClient(client: GetClientRecordV1) {
    this.selectedClient.emit(client);
    this.currentClient$.next(client);
  }
  isClientSelected(clientId: string) {
    return this.currentClient$.pipe(map((c) => c?.id == clientId));
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
    this.ClientListService.page.setValue(1);
  }
}
