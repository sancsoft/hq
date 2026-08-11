import { CommonModule } from '@angular/common';
import { StaffDetailsService } from './../staff-details.service';
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'hq-staff-contacts',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './staff-contacts.component.html',
})
export class StaffContactsComponent {
  constructor(public staffDetailsService: StaffDetailsService) {}
}
