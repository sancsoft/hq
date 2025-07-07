import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CoreModule } from '../../../../core/core.module';
import { Period } from '../../../../enums/period';
import { InvoiceDetaisService } from '../../../service/invoice-details.service';

@Component({
  selector: 'hq-invoice-time-search-filter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    CoreModule,
  ],
  templateUrl: './invoice-time-search-filter.component.html',
})
export class InvoiceTimeSearchFilterComponent {
  constructor(public invoiceDetailsService: InvoiceDetaisService) {}

  showHideDates() {
    if (this.invoiceDetailsService.selectedPeriod.value == Period.Custom) {
      this.invoiceDetailsService.showStartDate();
      this.invoiceDetailsService.showEndDate();
    } else {
      this.invoiceDetailsService.hideStartDate();
      this.invoiceDetailsService.hideEndDate();
    }
  }
}