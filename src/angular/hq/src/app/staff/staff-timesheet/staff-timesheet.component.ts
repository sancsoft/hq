import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, Observable } from 'rxjs';
import { StaffDashboardComponent } from '../../staff-dashboard/staff-dashboard.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'hq-staff-timesheet',
  standalone: true,
  imports: [StaffDashboardComponent, CommonModule],
  templateUrl: './staff-timesheet.component.html',
})
export class StaffTimesheetComponent {
  staffId$: Observable<string | null>;

  constructor(private route: ActivatedRoute) {
    this.staffId$ = route.paramMap.pipe(map((t) => t.get('staffId')));
  }
}
