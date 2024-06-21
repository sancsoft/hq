import { SortIconComponent } from './../../../common/sort-icon/sort-icon.component';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import {
  catchError,
  debounceTime,
  map,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  GetProjectRecordV1,
  SortColumn,
} from '../../../models/projects/get-project-v1';
import { APIError } from '../../../errors/apierror';
import { HQService } from '../../../services/hq.service';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from '../../../common/paginator/paginator.component';
import { ClientDetailsService } from '../../client-details.service';
import { GetClientRequestV1 } from '../../../models/clients/get-client-v1';
import { SortDirection } from '../../../models/common/sort-direction';
import { InRolePipe } from '../../../pipes/in-role.pipe';
import { HQRole } from '../../../enums/hqrole';

@Component({
  selector: 'hq-client-project-list',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    PaginatorComponent,
    SortIconComponent,
    InRolePipe,
  ],
  templateUrl: './client-project-list.component.html',
})
export class ClientProjectListComponent implements OnInit {
  ngOnInit(): void {}
  projects$: Observable<GetProjectRecordV1[]>;
  apiErrors: string[] = [];
  clientId?: string;
  sortColumn = SortColumn;
  sortDirection = SortDirection;
  HQRole = HQRole;

  itemsPerPage = new FormControl(20, { nonNullable: true });

  page = new FormControl<number>(1, { nonNullable: true });

  skipDisplay$: Observable<number>;
  takeToDisplay$: Observable<number>;
  totalRecords$: Observable<number>;
  sortOption$: BehaviorSubject<SortColumn>;
  sortDirection$: BehaviorSubject<SortDirection>;

  constructor(
    private hqService: HQService,
    private route: ActivatedRoute,
    private clientDetailService: ClientDetailsService,
  ) {
    const itemsPerPage$ = this.itemsPerPage.valueChanges.pipe(
      startWith(this.itemsPerPage.value),
    );

    const clientId$ = this.route.parent!.params.pipe(map((t) => t['clientId']));
    this.sortOption$ = new BehaviorSubject<SortColumn>(SortColumn.ProjectName);
    this.sortDirection$ = new BehaviorSubject<SortDirection>(SortDirection.Asc);
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
      clientId: clientId$,
      search: search$,
      skip: skip$,
      take: itemsPerPage$,
      sortBy: this.sortOption$,
      sortDirection: this.sortDirection$,
    });

    const response$ = request$.pipe(
      debounceTime(500),
      switchMap((request) => this.hqService.getProjectsV1(request)),
      shareReplay(1),
    );

    this.projects$ = response$.pipe(
      map((response) => {
        return response.records;
      }),
    );
    // this.projects$.subscribe((records) => console.log(records));

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
    this.clientDetailService.showProjectStatus();
    this.clientDetailService.showCurrentOnly();
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
}
