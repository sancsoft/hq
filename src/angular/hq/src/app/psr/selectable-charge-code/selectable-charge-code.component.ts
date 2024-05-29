import { GetChargeCodeRecordV1 } from './../../models/charge-codes/get-chargecodes-v1';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HQService } from '../../services/hq.service';
import {
  SortColumn,
} from '../../models/charge-codes/get-chargecodes-v1';
import { SortDirection } from '../../models/common/sort-direction';
import {
  FormControl,
  FormControlDirective,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  BehaviorSubject,
  Observable,
  Subject,
  combineLatest,
  debounceTime,
  map,
  of,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from '../../common/paginator/paginator.component';
import { SortIconComponent } from '../../common/sort-icon/sort-icon.component';


@Component({
  selector: 'hq-selectable-charge-code',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PaginatorComponent, SortIconComponent, RouterLink],
  templateUrl: './selectable-charge-code.component.html'
})

export class SelectableChargeCodeComponent {
  @Output() selectedChargeCode = new EventEmitter<GetChargeCodeRecordV1>();

  search = new FormControl('', { nonNullable: true });
  itemsPerPage = new FormControl(10, { nonNullable: true });
  page = new FormControl<number>(1, { nonNullable: true });

  records$: Observable<GetChargeCodeRecordV1[]>;
  skipDisplay$: Observable<number>;
  takeToDisplay$: Observable<number>;
  totalRecords$: Observable<number>;
  sortOption$: BehaviorSubject<SortColumn>;
  sortDirection$: BehaviorSubject<SortDirection>;

  sortColumn = SortColumn;
  sortDirection = SortDirection;
  private currentChargeCode$ = new BehaviorSubject<GetChargeCodeRecordV1 | null>(null);

  constructor(private hqService: HQService) {
    this.sortOption$ = new BehaviorSubject<SortColumn>(SortColumn.Code);
    this.sortDirection$ = new BehaviorSubject<SortDirection>(SortDirection.Asc);
    const search$ = this.search.valueChanges.pipe(
      tap((t) => this.goToPage(1)),
      startWith(this.search.value)
    );

    const itemsPerPage$ = this.itemsPerPage.valueChanges.pipe(
      tap((t) => this.goToPage(1)),
      startWith(this.itemsPerPage.value)
    );

    const page$ = this.page.valueChanges.pipe(startWith(this.page.value));

    const skip$ = combineLatest([itemsPerPage$, page$]).pipe(
      map(([itemsPerPage, page]) => (page - 1) * itemsPerPage)
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
      switchMap((request) => hqService.getChargeCodeseV1(request)),
      shareReplay(1)
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
        Math.min(skip + itemsPerPage, totalRecords)
      )
    );
  }

  goToPage(page: number) {
    this.page.setValue(page);
  }
  toggleChargeCode(client: GetChargeCodeRecordV1) {
    this.selectedChargeCode.emit(client);
    this.currentChargeCode$.next(client);
  }
  isChargeCodeSelected(id: string) {
    return this.currentChargeCode$.pipe(map((c) => c?.id == id));
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
