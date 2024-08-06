import { Component } from '@angular/core';
import { GetPSRRecordV1 } from '../../../models/PSR/get-PSR-v1';
import { HQMarkdownComponent } from '../../../common/markdown/markdown.component';
import { HQService } from '../../../services/hq.service';
import { filter, map, Observable, switchMap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'hq-project-report',
  standalone: true,
  imports: [CommonModule, HQMarkdownComponent],
  templateUrl: './project-report.component.html',
})
export class ProjectReportComponent {
  psr$?: Observable<GetPSRRecordV1 | null>;
  psrId$: Observable<string | null>;

  constructor(
    private hqService: HQService,
    private route: ActivatedRoute,
  ) {
    this.psrId$ = route.queryParams.pipe(map((t) => t['psrId']));

    this.psr$ = this.psrId$.pipe(
      filter((t) => !!t),
      switchMap((id) => hqService.getPSRV1({ id: id! })),
      map((t) => t.records[0]),
    );
  }
}
