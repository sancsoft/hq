import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, tap } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { GetPSRRecordV1 } from '../../models/PSR/get-PSR-v1';
import { HQService } from '../../services/hq.service';
import { GetPSRTimeRecordV1 } from '../../models/PSR/get-psr-time-v1';
import { CommonModule } from '@angular/common';
import { TimeStatus } from '../../models/common/time-status';

@Component({
  selector: 'hq-project-time',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './project-time.component.html',
})
export class ProjectTimeComponent {
  psrTimes$?: Observable<[GetPSRTimeRecordV1] | null>;
  psrId$: Observable<string | null>;
  timeStatus = TimeStatus;


  constructor(private hqService: HQService, private route: ActivatedRoute) {
    this.psrId$ = route.queryParams.pipe(map((t) => t['psrId']));
    this.psrId$.subscribe((id) => {
      if (id) {
        this.psrTimes$ = hqService
          .getPSRTimeV1({ ProjectStatusReportId: id })
          .pipe(
            map((t) => t.records),
            tap((t) => {
              console.log(t);
            })
          );
      }
    });
  }
}
