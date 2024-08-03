import { Component } from '@angular/core';
import { StaffListService } from '../staff-list/staff-list.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SelectInputOptionDirective } from '../../core/directives/select-input-option.directive';
import { SelectInputComponent } from '../../core/components/select-input/select-input.component';

@Component({
  selector: 'hq-staff-list-search-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SelectInputOptionDirective, SelectInputComponent],
  templateUrl: './staff-list-search-filter.component.html',
})
export class StaffListSearchFilterComponent {
  constructor(public staffListService: StaffListService) {}
}
