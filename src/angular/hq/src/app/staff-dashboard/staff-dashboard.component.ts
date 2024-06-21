import { Component } from '@angular/core';
import { StaffDashboardService } from './staff-dashboard.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Period } from '../models/times/get-time-v1';

@Component({
  selector: 'hq-staff-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [StaffDashboardService],
  templateUrl: './staff-dashboard.component.html',
})
export class StaffDashboardComponent {
  constructor(public staffDashboardService: StaffDashboardService) {}

  Period = Period;
}
