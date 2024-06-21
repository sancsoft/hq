import { Component } from '@angular/core';
import { TimeService } from '../../services/TimeService';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Period } from '../../../models/times/get-time-v1';

@Component({
  selector: 'hq-time-search-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './time-search-filter.component.html',
})
export class TimeSearchFilterComponent {
  constructor(public timeService: TimeService) {}

  showHideDates() {
    if (this.timeService.selectedPeriod.value == Period.Custom) {
      this.timeService.showStartDate();
      this.timeService.showEndDate();
    } else {
      this.timeService.hideStartDate();
      this.timeService.hideEndDate();
    }
  }
}
