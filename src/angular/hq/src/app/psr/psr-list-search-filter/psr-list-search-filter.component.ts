import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PsrListService } from '../psrlist/psrList.service';
import { Period } from '../../enums/period';

@Component({
  selector: 'hq-psr-list-search-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './psr-list-search-filter.component.html',
})
export class PsrListSearchFilterComponent {
  constructor(public psrListService: PsrListService) {}

  showHideDates() {
    if (this.psrListService.selectedPeriod.value == Period.Custom) {
      this.psrListService.showStartDate();
      this.psrListService.showEndDate();
    } else {
      this.psrListService.hideStartDate();
      this.psrListService.hideEndDate();
    }
  }
}
