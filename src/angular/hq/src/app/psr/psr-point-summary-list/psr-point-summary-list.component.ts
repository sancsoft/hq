import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HQService } from '../../services/hq.service';
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  map,
  switchMap,
} from 'rxjs';
import { SortDirection } from '../../models/common/sort-direction';
import { SortIconComponent } from '../../common/sort-icon/sort-icon.component';
import { GetPSRPointSummaryRecordV1 } from '../../models/PSR/get-psr-point-summary-v1';

export type SortColumn = 'staffName' | 'allocatedPoints' | 'utilizedPoints';

const SortColumnKeys = [
  'StaffName',
  'AllocatedPoints',
  'UtilizedPoints',
] as const;
type SortColumnKeys = (typeof SortColumnKeys)[number];

@Component({
  selector: 'hq-psr-point-summary-list',
  imports: [CommonModule, SortIconComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './psr-point-summary-list.component.html',
})
export class PsrPointSummaryListComponent implements OnInit {
  pointSummary$: Observable<{
    records: GetPSRPointSummaryRecordV1[];
    totalAllocated: number;
    totalUtilized: number;
  }>;
  psrId$: Observable<string | null>;
  sortOption$: BehaviorSubject<SortColumn>;
  sortDirection$: BehaviorSubject<SortDirection>;

  sortColumn: Record<SortColumnKeys, SortColumn> = {
    StaffName: 'staffName',
    AllocatedPoints: 'allocatedPoints',
    UtilizedPoints: 'utilizedPoints',
  };

  protected readonly round = Math.round;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private hqService: HQService,
  ) {
    this.psrId$ = new BehaviorSubject<string | null>(null);
    this.pointSummary$ = new BehaviorSubject<{
      records: GetPSRPointSummaryRecordV1[];
      totalAllocated: number;
      totalUtilized: number;
    }>({ records: [], totalAllocated: 0, totalUtilized: 0 });
    this.sortOption$ = new BehaviorSubject<SortColumn>('staffName');
    this.sortDirection$ = new BehaviorSubject<SortDirection>(SortDirection.Asc);
  }

  ngOnInit() {
    this.psrId$ = this.route.parent!.params.pipe(
      map((params) => params['psrId']),
    );

    const request$ = combineLatest({
      psrId: this.psrId$,
      sortBy: this.sortOption$,
      sortDirection: this.sortDirection$,
    }).pipe(
      map(({ psrId }) => ({
        projectStatusReportId: psrId!,
      })),
    );

    this.pointSummary$ = request$.pipe(
      switchMap((request) => this.hqService.getPSRPointSummaryV1(request)),
      map((response) => {
        const records = [...response.staff];
        const sortBy = this.sortOption$.value;
        const sortDir = this.sortDirection$.value;

        records.sort((a, b) => {
          let valA: string | number = '';
          let valB: string | number = '';

          if (sortBy === 'staffName') {
            valA = a.staffName.toLowerCase();
            valB = b.staffName.toLowerCase();
          } else if (sortBy === 'allocatedPoints') {
            valA = a.allocatedPoints;
            valB = b.allocatedPoints;
          } else if (sortBy === 'utilizedPoints') {
            valA = a.utilizedPoints;
            valB = b.utilizedPoints;
          }

          if (valA < valB) return sortDir === SortDirection.Asc ? -1 : 1;
          if (valA > valB) return sortDir === SortDirection.Asc ? 1 : -1;
          return 0;
        });

        const totalAllocated = records.reduce(
          (sum, r) => sum + r.allocatedPoints,
          0,
        );
        const totalUtilized = records.reduce(
          (sum, r) => sum + r.utilizedPoints,
          0,
        );

        return { records, totalAllocated, totalUtilized };
      }),
    );
  }

  onSortClick(sortColumn: SortColumn) {
    if (this.sortOption$.value === sortColumn) {
      this.sortDirection$.next(
        this.sortDirection$.value === SortDirection.Asc
          ? SortDirection.Desc
          : SortDirection.Asc,
      );
    } else {
      this.sortOption$.next(sortColumn);
      this.sortDirection$.next(SortDirection.Asc);
    }
  }
}
