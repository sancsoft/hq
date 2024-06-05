import { Component, Input } from '@angular/core';
import { GetPSRRecordV1, GetPSRV1 } from '../../models/PSR/get-PSR-v1';
import { HQMarkdownComponent } from '../../common/markdown/markdown.component';
import { HQService } from '../../services/hq.service';
import { map, Observable, shareReplay } from 'rxjs';
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
  projectId$: Observable<string | null>;

  constructor(private hqService: HQService, private route: ActivatedRoute) {
    this.projectId$ = route.queryParams.pipe(map((t) => t['projectId']));
    this.projectId$.subscribe((id) => {
      console.log(id);
      if (id) {
        this.psr$ = hqService
          .getPSRV1({ projectId: id })
          .pipe(map((t) => t.records[0]));
      }
    });
  }
}
