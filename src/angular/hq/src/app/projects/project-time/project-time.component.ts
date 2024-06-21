import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  map,
  switchMap,
  tap,
} from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { SortColumn } from '../../models/PSR/get-psr-time-v1';
import { HQService } from '../../services/hq.service';
import { GetPSRTimeRecordV1 } from '../../models/PSR/get-psr-time-v1';
import { CommonModule } from '@angular/common';
import { TimeStatus } from '../../models/common/time-status';
import { SortDirection } from '../../models/common/sort-direction';
import { SortIconComponent } from '../../common/sort-icon/sort-icon.component';

@Component({
  selector: 'hq-project-time',
  standalone: true,
  imports: [CommonModule, RouterLink, SortIconComponent],
  templateUrl: './project-time.component.html',
})
export class ProjectTimeComponent {
  psrTimes$?: Observable<[GetPSRTimeRecordV1] | null>;
  psrId$: Observable<string | null>;
  timeStatus = TimeStatus;
  sortOption$: BehaviorSubject<SortColumn>;
  sortDirection$: BehaviorSubject<SortDirection>;

  sortColumn = SortColumn;
  sortDirection = SortDirection;

  constructor(
    private hqService: HQService,
    private route: ActivatedRoute,
  ) {
    this.sortOption$ = new BehaviorSubject<SortColumn>(SortColumn.Date);
    this.sortDirection$ = new BehaviorSubject<SortDirection>(SortDirection.Asc);

    this.psrId$ = route.queryParams.pipe(map((t) => t['psrId']));
    const request$ = combineLatest({
      projectStatusReportId: this.psrId$,
      sortBy: this.sortOption$,
      sortDirection: this.sortDirection$,
    });
    const apiResponse$ = request$.pipe(
      debounceTime(500),
      switchMap((request) => this.hqService.getPSRTimeV1(request)),
    );
    this.psrTimes$ = apiResponse$.pipe(map((response) => response.records));
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
