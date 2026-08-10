import { Component, ChangeDetectionStrategy } from '@angular/core';
import { StaffDashboardService } from '../service/staff-dashboard.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'hq-staff-dashboard-date-range',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './staff-dashboard-date-range.component.html',
})
export class StaffDashboardDateRangeComponent {
  constructor(public staffDashboardService: StaffDashboardService) {}
}
