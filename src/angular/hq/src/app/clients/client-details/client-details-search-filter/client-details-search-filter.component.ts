import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClientDetailsService } from '../client-details.service';
import { SearchInputComponent } from '../../../core/components/search-input/search-input.component';
import { SelectInputComponent } from '../../../core/components/select-input/select-input.component';
import { SelectInputOptionDirective } from '../../../core/directives/select-input-option.directive';
import { enumToArrayObservable } from '../../../core/functions/enum-to-array';
import { ProjectStatus } from '../../../enums/project-status';
import { enumToArray } from '../../../core/functions/enum-to-array';

import { ClientProjectListService } from '../client-project-list/client-project-list.service';
@Component({
  selector: 'hq-client-details-search-filter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SearchInputComponent,
    SelectInputComponent,
    SelectInputOptionDirective,
  ],
  templateUrl: './client-details-search-filter.component.html',
})
export class ClientDetailsSearchFilterComponent {
  projectStatus = enumToArray(ProjectStatus);

  public projectStatusEnum$ = enumToArrayObservable(ProjectStatus);
  constructor(
    public clientDetailService: ClientDetailsService,
    public clientProjectListService: ClientProjectListService,
  ) {}

  onToggleChange(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    const newStatus = isChecked ? 10 : null;
    this.clientDetailService.projectStatus.setValue(newStatus);
    this.clientDetailService.toggleStatus.setValue(isChecked);
  }
}
