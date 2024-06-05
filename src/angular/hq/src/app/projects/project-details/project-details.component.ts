import { HQService } from './../../services/hq.service';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { Observable, map } from 'rxjs';
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

  constructor(private hqService: HQService, private route: ActivatedRoute) {
    this.projectId$ = route.queryParams.pipe(map((t) => t['projectId']));
    this.projectId$.subscribe((id) => {
      if (id) {
        this.project$ = hqService.getProjectV1(id).pipe(
          map((t) => t.records),
          map((t) => {
            if (t) {
              return t[0];
            }
            return null;
          })
        );

        this.psr$ = hqService
          .getPSRV1({ projectId: id })
          .pipe(map((t) => t.records),
          map((t)=>{
            if(t) {
              return t[0]
            }
            return null;
          })
        );
      }
    });
  }
}
