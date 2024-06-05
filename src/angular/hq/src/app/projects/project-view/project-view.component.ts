import { ProjectPsrDetailsComponent } from './project-psr-details/project-psr-details.component';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { Observable, map, of, switchMap, tap } from 'rxjs';
import { PsrWorkWeekComponent } from './psr-work-week/psr-work-week.component';
import { GetPSRRecordsV1, GetPSRRecordV1 } from '../../models/PSR/get-PSR-v1';
import { HQService } from '../../services/hq.service';
import { GetProjectRecordV1 } from '../../models/projects/get-project-v1';
import { GetClientRecordV1 } from '../../models/clients/get-client-v1';

@Component({
  selector: 'hq-project-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    PsrWorkWeekComponent,
    ProjectPsrDetailsComponent
  ],
  templateUrl: './project-view.component.html',
})

export class ProjectViewComponent {
  projectId$: Observable<string | null>;
  psrId$: Observable<string|null>;
  psrWorkWeeks$?: Observable<GetPSRRecordV1[]> | null;
  projectDetail$?: Observable<GetProjectRecordV1 | null>;
  clientDetail$?: Observable<GetClientRecordV1 | null>;

  sideBarCollapsed = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private hqService: HQService
  ) {
    this.projectId$ = this.route.params.pipe(map((params) => params['projectId']));
    this.psrId$ = route.queryParams.pipe(
      map(t => t['psrId'])
    );
    this.projectId$.subscribe(
      (id) => {
        console.log(id);
        if (id) {
          this.psrWorkWeeks$ = this.hqService.getProjectPSRV1(id).pipe(map((response) => response.records));
          this.projectDetail$ = this.hqService.getProjectV1(id).pipe(
            map((response) => response.records ? response.records[0] : null)
          );
        }
      })

  this.projectDetail$?.pipe(
      switchMap((project) => {
        if (project?.clientId) {
          return this.hqService.getClientsV1({ id: project.clientId }).pipe(
            map((response) => response.records)
          );
        }
        return of(null);
      })
    ).subscribe((clientDetails) => {
      console.log(clientDetails);
      if(clientDetails)
      this.clientDetail$ = of(clientDetails[0])
    });
  }
  psrSelected(psrId: string) {
    console.log(psrId);
    this.psrId$ = of(psrId);

  }
}
