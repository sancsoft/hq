import { CommonModule } from '@angular/common';
import { StaffDetailsService } from './../staff-details.service';
import { Component } from '@angular/core';

@Component({
  selector: 'hq-staff-contacts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './staff-contacts.component.html',
})
export class StaffContactsComponent {
  constructor(public staffDetailsService: StaffDetailsService) {}
}
