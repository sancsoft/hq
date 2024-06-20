import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  Observable,
  BehaviorSubject,
  startWith,
  combineLatest,
  map,
  tap,
  debounceTime,
  switchMap,
  shareReplay,
} from 'rxjs';
import { ProjectStatus } from '../../clients/client-details.service';
import { SortColumn } from '../../models/projects/get-project-v1';
import { SortDirection } from '../../models/common/sort-direction';
import { GetPSRRecordV1 } from '../../models/PSR/get-PSR-v1';
import { HQService } from '../../services/hq.service';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from '../../common/paginator/paginator.component';
import { SortIconComponent } from '../../common/sort-icon/sort-icon.component';
import { PsrSearchFilterComponent } from '../../psr/psr-search-filter/psr-search-filter.component';
import { GetProjectRecordV1 } from '../../models/projects/get-project-v1';
import { PsrService } from '../../psr/psr-service';
import { HQRole } from '../../enums/hqrole';
import { InRolePipe } from '../../pipes/in-role.pipe';

@Component({
  selector: 'hq-project-list',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    ReactiveFormsModule,
    PaginatorComponent,
    SortIconComponent,
    PsrSearchFilterComponent,
    InRolePipe
  ],
  templateUrl: './project-list.component.html',
})
export class ProjectListComponent {
  apiErrors: string[] = [];

  skipDisplay$: Observable<number>;
  takeToDisplay$: Observable<number>;
  totalRecords$: Observable<number>;
  projects$: Observable<GetProjectRecordV1[]>;
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
    private psrService: PsrService
  ) {
    this.sortOption$ = new BehaviorSubject<SortColumn>(SortColumn.ProjectName);
    this.sortDirection$ = new BehaviorSubject<SortDirection>(SortDirection.Asc);

    const itemsPerPage$ = this.itemsPerPage.valueChanges.pipe(
      startWith(this.itemsPerPage.value)
    );
    const page$ = this.page.valueChanges.pipe(startWith(this.page.value));

    const skip$ = combineLatest([itemsPerPage$, page$]).pipe(
      map(([itemsPerPage, page]) => (page - 1) * itemsPerPage),
      startWith(0)
    );
    const search$ = psrService.search.valueChanges.pipe(
      tap((t) => this.goToPage(1)),
      startWith(psrService.search.value)
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
      switchMap((request) => this.hqService.getProjectsV1(request)),
      shareReplay(1)
    );

    this.projects$ = response$.pipe(
      map((response) => {
        return response.records;
      })
    );

    this.totalRecords$ = response$.pipe(map((t) => t.total!));
    this.projects$.subscribe((records) => {
      console.log(records);
    });

    this.takeToDisplay$ = combineLatest([
      skip$,
      itemsPerPage$,
      this.totalRecords$,
    ]).pipe(
      map(([skip, itemsPerPage, totalRecords]) =>
        Math.min(skip + itemsPerPage, totalRecords)
      )
    );

    this.psrService.resetFilter();
  }

  goToPage(page: number) {
    this.page.setValue(page);
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
  getProjectSatusString(status: ProjectStatus): string {
    return ProjectStatus[status];
  }
}
