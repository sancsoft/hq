import { ChargeCodeListService } from './../services/ChargeCodeListService';
import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { PsrService } from "../../psr/psr-service";


@Component({
  selector: 'hq-psr-search-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './charge-code-search-filter.component.html',
})
export class ChargeCodeSearchFilterComponent {
  constructor(public ChargeCodeListService: ChargeCodeListService) {
    
  }
}