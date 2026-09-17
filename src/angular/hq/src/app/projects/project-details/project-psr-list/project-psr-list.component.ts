import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import {
  GetPSRRecordV1,
  GetPSRRequestV1,
  SortColumn,
} from '../../../models/PSR/get-PSR-v1';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HQService } from '../../../services/hq.service';
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  map,
  switchMap,
} from 'rxjs';
import { SortDirection } from '../../../models/common/sort-direction';
import { SortIconComponent } from '../../../common/sort-icon/sort-icon.component';
import { ProjectDetailsSearchService } from '../project-details-search.service';

@Component({
  selector: 'hq-project-psr-list',
  imports: [CommonModule, RouterLink, SortIconComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './project-psr-list.component.html',
})
export class ProjectPsrListComponent {
  PSRWorkWeeks?: Observable<GetPSRRecordV1[]> | null;
  projectId$?: Observable<string>;
  sortOption$: BehaviorSubject<SortColumn>;
  sortDirection$: BehaviorSubject<SortDirection>;
  psrId$: Observable<string | null>;

  sortColumn = SortColumn;
  sortDirection = SortDirection;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private hqService: HQService,
    private searchService: ProjectDetailsSearchService,
  ) {
    this.sortOption$ = new BehaviorSubject<SortColumn>(SortColumn.StartDate);
    this.sortDirection$ = new BehaviorSubject<SortDirection>(SortDirection.Asc);
    this.projectId$ = route.params.pipe(map((params) => params['projectId']));
    this.psrId$ = route.queryParams.pipe(map((t) => t['psrId']));

    const request$ = combineLatest({
      projectId: this.projectId$,
      sortBy: this.sortOption$,
      sortDirection: this.sortDirection$,
      weekOf: this.searchService.selectedWeekDateString$,
    });
    const apiResponse$ = request$.pipe(
      switchMap(({ projectId, sortBy, sortDirection, weekOf }) => {
        const params: Partial<GetPSRRequestV1> = {
          projectId,
          sortBy,
          sortDirection,
        };
        if (weekOf) {
          params.startDate = weekOf as unknown as Date;
          params.endDate = weekOf as unknown as Date;
        }
        return this.hqService.getPSRV1(params);
      }),
    );
    this.PSRWorkWeeks = apiResponse$.pipe(map((response) => response.records));
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
  }
}
