import { Component, Input } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { GetPSRTimeRecordV1 } from '../../../models/PSR/get-psr-time-v1';
import { TimeStatus } from '../../../models/common/time-status';
import { HQService } from '../../../services/hq.service';
import { CommonModule } from '@angular/common';
import { GetPSRRecordV1 } from '../../../models/PSR/get-PSR-v1';

@Component({
  selector: 'hq-project-psr-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './project-psr-details.component.html'
})
export class ProjectPsrDetailsComponent {
  psr$?: Observable<GetPSRRecordV1 | null>;
  psrId$? :Observable<string | null>;

  constructor(private hqService: HQService, private route: ActivatedRoute) {
    this.psrId$ = route.queryParams.pipe(
      map(t => t['psrId']),
    );
    this.psrId$?.subscribe((id) => {
      console.log(id);
      if (id) {
        this.psr$ = hqService
         .getPSRV1({ id: id })
         .pipe(map((t) => t.records[0]));
      }
    })
  }
}
