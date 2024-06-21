import { CommonModule } from '@angular/common';
import { GetPSRRequestV1 } from './../../models/PSR/get-PSR-v1';
import { Component, EventEmitter, Output } from '@angular/core';
import {
  Observable,
  combineLatest,
  debounceTime,
  map,
  shareReplay,
  switchMap,
} from 'rxjs';
import { GetPSRRecordV1 } from '../../models/PSR/get-PSR-v1';
import { ActivatedRoute } from '@angular/router';
import { HQService } from '../../services/hq.service';
import { Period } from '../../projects/project-create/project-create.component';

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
  ) {
    this.projectReportId$ = activatedRoute.paramMap.pipe(
      map((params) => params.get('psrId')),
    );
    const request$ = combineLatest({
      id: this.projectReportId$,
    });
    const response$ = request$.pipe(
      debounceTime(500),
      switchMap((request) => this.hqService.getPSRV1(request)),
      shareReplay(1),
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
