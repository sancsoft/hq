import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'hq-project-details',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './project-details.component.html'
})
export class ProjectDetailsComponent {
  
  psrId$: Observable<string|null>;

  constructor(private route: ActivatedRoute) {
    this.psrId$ = route.queryParams.pipe(
      map(t => t['psrId'])
    );
  }

}
