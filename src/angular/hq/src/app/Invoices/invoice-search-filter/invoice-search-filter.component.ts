import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Period } from '../../enums/period';
import { InvoiceListService } from '../invoices-list/invoices-list.service';
import { CoreModule } from '../../core/core.module';
import { Component } from '@angular/core';

@Component({
  selector: 'hq-invoice-search-filter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    CoreModule,
  ],
  templateUrl: './invoice-search-filter.component.html',
})
export class InvoiceSearchFilterComponent {
  constructor(public invoiceService: InvoiceListService) {}

  Period = Period;

  showHideDates() {
    if (this.invoiceService.selectedPeriod.value == Period.Custom) {
      this.invoiceService.showStartDate();
      this.invoiceService.showEndDate();
    } else {
      this.invoiceService.hideStartDate();
      this.invoiceService.hideEndDate();
    }
  }
}
