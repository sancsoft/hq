import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { CoreModule } from "../../../core/core.module";

@Component({
  selector: 'hq-invoice-time-entries',
  standalone: true,
  imports: [
    CommonModule,
    CoreModule,
  ],
  templateUrl: './invoice-time.component.html',
})
export class InvoiceTimeEntriesComponent {
  constructor(){}

  ngOnInit(){

  }
}