import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Observable, map, tap } from 'rxjs';

@Component({
  selector: 'hq-project-view',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './project-view.component.html'
})
export class ProjectViewComponent {

  psrId$: Observable<string|null>;

  constructor(private route: ActivatedRoute) {
    this.psrId$ = route.queryParams.pipe(
      map(t => t['psrId'])
    );
  }

}
