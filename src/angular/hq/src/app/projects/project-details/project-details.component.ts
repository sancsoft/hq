/* eslint-disable rxjs-angular/prefer-takeuntil */
/* eslint-disable rxjs-angular/prefer-async-pipe */
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
import { map } from 'rxjs';
import { ProjectPsrListComponent } from './project-psr-list/project-psr-list.component';
import { DualPanelComponent } from '../../core/components/dual-panel/dual-panel.component';
import { CoreModule } from '../../core/core.module';
import { PanelComponent } from '../../core/components/panel/panel.component';
import { ProjectDetailsService } from './project-details.service';

@Component({
  selector: 'hq-project-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ProjectPsrListComponent,
    ProjectPsrDetailsComponent,
    CoreModule,
    PanelComponent,
    DualPanelComponent,
  ],
  providers: [ProjectDetailsService],
  templateUrl: './project-details.component.html',
})
export class ProjectDetailsComponent {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public projectDetailService: ProjectDetailsService,
  ) {
    const projectId$ = this.route.paramMap.pipe(
      map((params) => params.get('projectId')),
    );

    const psrId$ = route.queryParamMap.pipe(
      map((params) => params.get('psrId')),
    );

    projectId$.subscribe({
      next: (projectId) => this.projectDetailService.setProjectId(projectId),
      error: console.error,
    });

    psrId$.subscribe({
      next: (psrId) => this.projectDetailService.setPsrId(psrId),
      error: console.error,
    });
  }
}
