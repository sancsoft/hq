import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'hq-project-create',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-create.component.html'
})
export class ProjectCreateComponent {
  modalOpen = false;
}
