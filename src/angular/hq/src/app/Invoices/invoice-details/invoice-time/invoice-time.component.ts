import { Component } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import {
  map,
  Subject,
} from 'rxjs';

import { InvoiceDetaisService } from '../../service/invoice-details.service';
@Component({
  selector: 'hq-invoice-time',
  standalone: true,
  imports: [
    RouterOutlet
  ],
  templateUrl: './invoice-time.component.html',
})
export class InvoiceTimeComponent {
  constructor(
  ) {}

  private destroy = new Subject<void>();

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }
}