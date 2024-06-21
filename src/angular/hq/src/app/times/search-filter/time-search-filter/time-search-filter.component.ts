import { Component } from '@angular/core';
import { TimeService } from '../../services/TimeService';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'hq-time-search-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './time-search-filter.component.html',
})
export class TimeSearchFilterComponent {
  constructor(public timeService: TimeService) {}
}
