import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
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
import { HQService } from '../../services/hq.service';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from '../../common/paginator/paginator.component';
import { SortIconComponent } from '../../common/sort-icon/sort-icon.component';
import { PsrSearchFilterComponent } from '../../psr/psr-search-filter/psr-search-filter.component';
import { GetProjectRecordV1 } from '../../models/projects/get-project-v1';
import { HQRole } from '../../enums/hqrole';
import { InRolePipe } from '../../pipes/in-role.pipe';
import { ProjectListSearchFilterComponent } from '../project-list-search-filter/project-list-search-filter.component';
import { ProjectSearchFilterService } from '../services/ProjectSearchFilterService';
import { Period } from '../../models/times/get-time-v1';

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
    InRolePipe,
    ProjectListSearchFilterComponent,
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

  sortColumn = SortColumn;
  sortDirection = SortDirection;
  HQRole = HQRole;
  ProjectStatus = ProjectStatus;
  Math = Math;

  constructor(
    private hqService: HQService,
    private route: ActivatedRoute,
    public projectSearchFilterService: ProjectSearchFilterService,
  ) {
    this.sortOption$ = new BehaviorSubject<SortColumn>(SortColumn.ProjectName);
    this.sortDirection$ = new BehaviorSubject<SortDirection>(SortDirection.Asc);

    const itemsPerPage$ =
      this.projectSearchFilterService.itemsPerPage.valueChanges.pipe(
        startWith(this.projectSearchFilterService.itemsPerPage.value),
      );
    const page$ = this.projectSearchFilterService.page.valueChanges.pipe(
      startWith(this.projectSearchFilterService.page.value),
    );

    const skip$ = combineLatest([itemsPerPage$, page$]).pipe(
      map(([itemsPerPage, page]) => (page - 1) * itemsPerPage),
      startWith(0),
    );
    const search$ = projectSearchFilterService.search.valueChanges.pipe(
      tap(() => this.goToPage(1)),
      startWith(projectSearchFilterService.search.value),
    );
    const projectManager$ =
      projectSearchFilterService.projectManager.valueChanges.pipe(
        tap(() => this.goToPage(1)),
        startWith(projectSearchFilterService.projectManager.value),
      );
    const projectStatus$ =
      projectSearchFilterService.projectStatus.valueChanges.pipe(
        tap(() => this.goToPage(1)),
        startWith(projectSearchFilterService.projectStatus.value),
      );

    this.skipDisplay$ = skip$.pipe(map((skip) => skip + 1));

    const request$ = combineLatest({
      search: search$,
      skip: skip$,
      projectManagerId: projectManager$,
      projectStatus: projectStatus$,
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
        Math.min(skip + itemsPerPage, totalRecords),
      ),
    );
  }

  goToPage(page: number) {
    this.projectSearchFilterService.page.setValue(page);
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
    this.projectSearchFilterService.page.setValue(1);
  }
  getProjectSatusString(status: ProjectStatus): string {
    return this.camelToFlat(ProjectStatus[status]);
  }
  camelToFlat = (camel: string) => {
    const camelCase = camel.replace(/([a-z])([A-Z])/g, '$1 $2').split(' ');

    let flat = '';

    camelCase.forEach((word) => {
      flat = flat + word.charAt(0).toUpperCase() + word.slice(1) + ' ';
    });
    return flat;
  };
  getPeriodName(period: Period) {
    return Period[period];
  }
}
