import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  Observable,
  combineLatest,
  debounceTime,
  map,
  merge,
  shareReplay,
  switchMap,
} from 'rxjs';
import { GetPSRRecordV1 } from '../../models/PSR/get-PSR-v1';
import { ActivatedRoute } from '@angular/router';
import { HQService } from '../../services/hq.service';
import { Period } from '../../enums/period';
import { PsrRefreshService } from '../Services/psr-refresh.service';

@Component({
  selector: 'hq-psr-details-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './psr-details-header.component.html',
})
export class PsrDetailsHeaderComponent {
  projectReportStatus$: Observable<GetPSRRecordV1>;
  projectReportId$: Observable<string | null>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private hqService: HQService,
    private psrRefreshService: PsrRefreshService,
  ) {
    this.projectReportId$ = activatedRoute.paramMap.pipe(
      map((params) => params.get('psrId')),
    );
    const request$ = combineLatest({
      id: this.projectReportId$,
    });

    const requestTrigger$ = merge(
      request$,
      this.psrRefreshService
        .getRefreshObservable()
        .pipe(switchMap(() => request$)),
    );

    const response$ = requestTrigger$.pipe(
      debounceTime(500),
      switchMap((request) => this.hqService.getPSRV1(request)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.projectReportStatus$ = response$.pipe(
      map((response) => {
        return response.records[0];
      }),
    );
  }
  getPeriodName(period: Period) {
    return Period[period];
  }
}
