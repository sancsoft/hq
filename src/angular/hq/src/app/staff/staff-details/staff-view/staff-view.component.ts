import { Component } from '@angular/core';
import { StaffDetailsService } from '../staff-details.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'hq-staff-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './staff-view.component.html',
})
export class StaffViewComponent {
  constructor(public staffDetailsService: StaffDetailsService) {}
}
