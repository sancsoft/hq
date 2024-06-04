import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { PsrWorkWeekComponent } from './psr-work-week/psr-work-week.component';

@Component({
  selector: 'hq-project-view',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, PsrWorkWeekComponent],
  templateUrl: './project-view.component.html'
})
export class ProjectViewComponent {

  psrId$: Observable<string|null>;
  sideBarCollapsed = false;

  constructor(private route: ActivatedRoute) {
    this.psrId$ = route.queryParams.pipe(
      map(t => t['psrId'])
    );
  }

}
