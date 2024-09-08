import { Component } from '@angular/core';
import { TimeListService } from '../../time-list/TimeList.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Period } from '../../../enums/period';
import { CoreModule } from '../../../core/core.module';

@Component({
  selector: 'hq-time-search-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CommonModule, CoreModule],
  templateUrl: './time-search-filter.component.html',
})
export class TimeSearchFilterComponent {
  constructor(public timeService: TimeListService) {}

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
