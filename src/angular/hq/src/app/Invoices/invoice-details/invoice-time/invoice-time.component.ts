import { Component, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subject } from 'rxjs';

@Component({
  selector: 'hq-invoice-time',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './invoice-time.component.html',
})
export class InvoiceTimeComponent implements OnDestroy {
  constructor() {}

  private destroy = new Subject<void>();

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }
}
