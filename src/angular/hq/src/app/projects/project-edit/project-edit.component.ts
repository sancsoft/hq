import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'hq-project-edit',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './project-edit.component.html'
})
export class ProjectEditComponent {
  
  psrId$: Observable<string|null>;

  constructor(private route: ActivatedRoute) {
    this.psrId$ = route.queryParams.pipe(
      map(t => t['psrId'])
    );
  }

}
