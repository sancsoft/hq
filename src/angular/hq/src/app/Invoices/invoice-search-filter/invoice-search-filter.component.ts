import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InvoiceListService } from '../invoices-list/invoice-list.service';
import { CoreModule } from '../../core/core.module';
import { Period } from '../../enums/period';

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
