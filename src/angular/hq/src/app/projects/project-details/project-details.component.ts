import { HQService } from './../../services/hq.service';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { Observable, filter, map, switchMap } from 'rxjs';
import { GetProjectRecordV1 } from '../../models/projects/get-project-v1';
import { Period } from '../project-create/project-create.component';
import { GetPSRRecordV1 } from '../../models/PSR/get-PSR-v1';
import { PdfViewerComponent } from '../../common/pdf-viewer/pdf-viewer.component';

@Component({
  selector: 'hq-project-details',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, PdfViewerComponent],
  templateUrl: './project-details.component.html',
})
export class ProjectDetailsComponent {
  project$?: Observable<GetProjectRecordV1 | null>;
  projectId$: Observable<string | null>;
  psr$?: Observable<GetPSRRecordV1 | null>;
  BookingPeriod = Period;

  constructor(
    private hqService: HQService,
    private route: ActivatedRoute,
  ) {
    this.projectId$ = route.parent!.params.pipe(map((t) => t['projectId']));

    this.project$ = this.projectId$.pipe(
      filter((t) => !!t),
      switchMap((id) => hqService.getProjectV1(id!)),
      map((t) => t.records[0]),
    );

    this.psr$ = this.projectId$.pipe(
      filter((t) => !!t),
      switchMap((id) => hqService.getPSRV1({ projectId: id! })),
      map((t) => t.records),
      map((t) => {
        if (t) {
          return t[0];
        }
        return null;
      }),
    );
  }
}
