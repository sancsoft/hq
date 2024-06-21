import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GetPSRRecordV1, SortColumn } from '../../../models/PSR/get-PSR-v1';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
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

@Component({
  selector: 'hq-psr-work-week',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    SortIconComponent,
  ],
  templateUrl: './psr-work-week.component.html',
})
export class PsrWorkWeekComponent {
  PSRWorkWeeks?: Observable<GetPSRRecordV1[]> | null;
  projectId$?: Observable<string>;
  sortOption$: BehaviorSubject<SortColumn>;
  sortDirection$: BehaviorSubject<SortDirection>;

  sortColumn = SortColumn;
  sortDirection = SortDirection;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private hqService: HQService,
  ) {
    this.sortOption$ = new BehaviorSubject<SortColumn>(SortColumn.StartDate);
    this.sortDirection$ = new BehaviorSubject<SortDirection>(SortDirection.Asc);
    this.projectId$ = route.params.pipe(map((params) => params['projectId']));
    const request$ = combineLatest({
      projectId: this.projectId$,
      sortBy: this.sortOption$,
      sortDirection: this.sortDirection$,
    });
    const apiResponse$ = request$.pipe(
      switchMap((request) => this.hqService.getPSRV1(request)),
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
