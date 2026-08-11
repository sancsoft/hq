import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StaffDashboardService } from '../service/staff-dashboard.service';
import { ButtonComponent } from '../../core/components/button/button.component';

@Component({
  selector: 'hq-staff-dashboard-search-filter',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './staff-dashboard-search-filter.component.html',
})
export class StaffDashboardSearchFilterComponent {
  constructor(public staffDashboardService: StaffDashboardService) {}
}
