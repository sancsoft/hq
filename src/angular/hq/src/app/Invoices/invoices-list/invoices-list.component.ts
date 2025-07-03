import { SortColumn } from './../../models/Invoices/get-invoices-v1';

import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { CommonModule } from '@angular/common';
import { SortDirection } from '../../models/common/sort-direction';
import { HQService } from '../../services/hq.service';
import { HQRole } from '../../enums/hqrole';
import { InRolePipe } from '../../pipes/in-role.pipe';
import { InvoiceListService } from './invoice-list.service';
import { CoreModule } from '../../core/core.module';
import { BaseListService } from '../../core/services/base-list.service';
import { InvoiceSearchFilterComponent } from '../invoice-search-filter/invoice-search-filter.component';

@Component({
  selector: 'hq-invoices-list',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    ReactiveFormsModule,
    InRolePipe,
    CoreModule,
    InvoiceSearchFilterComponent,
  ],
  providers: [
    {
      provide: BaseListService,
      useExisting: InvoiceListService,
    },
  ],
  templateUrl: './invoices-list.component.html',
})
export class InvoicesListComponent {
  apiErrors: string[] = [];

  itemsPerPage = new FormControl(20, { nonNullable: true });
  page = new FormControl<number>(1, { nonNullable: true });

  sortColumn = SortColumn;
  sortDirection = SortDirection;
  HQRole = HQRole;

  constructor(
    private hqService: HQService,
    private route: ActivatedRoute,
    public invoiceListService: InvoiceListService,
  ) {}

  goToPage(page: number) {
    this.invoiceListService.page.setValue(page);
  }

  onSortClick(sortColumn: SortColumn) {
    if (this.invoiceListService.sortOption$.value == sortColumn) {
      this.invoiceListService.sortDirection$.next(
        this.invoiceListService.sortDirection$.value == SortDirection.Asc
          ? SortDirection.Desc
          : SortDirection.Asc,
      );
    } else {
      this.invoiceListService.sortOption$.next(sortColumn);
      this.invoiceListService.sortDirection$.next(SortDirection.Asc);
    }
    this.invoiceListService.page.setValue(1);
  }
}
