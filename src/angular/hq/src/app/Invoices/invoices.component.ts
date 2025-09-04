import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'hq-invoices',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './invoices.component.html',
})
export class InvoicesComponent {}
