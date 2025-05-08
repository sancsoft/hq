import { Component } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { map, Subject } from 'rxjs';

import { InvoiceDetaisService } from '../service/invoice-details.service';
@Component({
  selector: 'hq-invoice-details',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './invoice-details.component.html',
})
export class InvoiceDetailsComponent {
  constructor(
    private route: ActivatedRoute,
    private invoiceDetailsService: InvoiceDetaisService,
  ) {
    const invoiceId$ = this.route.paramMap.pipe(
      map((params) => params.get('invoiceId')),
    );

    invoiceId$.subscribe({
      next: (invoiceId) => this.invoiceDetailsService.setInvoiceId(invoiceId),
      error: console.error,
    });
  }

  private destroy = new Subject<void>();

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }
}
