import { Component } from '@angular/core';
import { ProjectSearchFilterService } from '../services/ProjectSearchFilterService';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'hq-project-list-search-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './project-list-search-filter.component.html',
})
export class ProjectListSearchFilterComponent {
  constructor(public projectSearchFilterService: ProjectSearchFilterService) {}
}
