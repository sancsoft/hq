import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { firstValueFrom, Subject } from 'rxjs';

import { InvoiceDetaisService } from '../service/invoice-details.service';
import { InvoiceTimeListService } from '../service/invoice-time-list.service';
@Component({
  selector: 'hq-invoice-details',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './invoice-details.component.html',
})
export class InvoiceDetailsComponent implements OnDestroy, OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private invoiceDetailsService: InvoiceDetaisService,
    private invoiceTimeListService: InvoiceTimeListService,
  ) {}

  async ngOnInit() {
    const invoiceId =
      (await firstValueFrom(this.route.paramMap.pipe())).get('invoiceId') ??
      null;

    if (invoiceId != null) {
      this.invoiceDetailsService.invoiceIdSubject.next(invoiceId);
      this.invoiceTimeListService.invoiceId$
    } else {
      await this.router.navigateByUrl('/invoices');
    }
  }

  private destroy = new Subject<void>();

  ngOnDestroy() {
    console.log('Destroyed');
    this.destroy.next();
    this.destroy.complete();
  }
}
