import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StaffDashboardService } from '../service/staff-dashboard.service';

@Component({
  selector: 'hq-staff-dashboard-search-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './staff-dashboard-search-filter.component.html',
})
export class StaffDashboardSearchFilterComponent {
  constructor(public staffDashboardService: StaffDashboardService) {}
}
