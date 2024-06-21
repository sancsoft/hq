import { Component } from '@angular/core';
import { StaffDashboardService } from './staff-dashboard.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'hq-staff-dashboard',
  standalone: true,
  imports: [CommonModule],
  providers: [StaffDashboardService],
  templateUrl: './staff-dashboard.component.html',
})
export class StaffDashboardComponent {
  constructor(public staffDashboardService: StaffDashboardService) {}
}
