import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClientDetailsService } from '../client-details.service';
import { SearchInputComponent } from '../../../core/components/search-input/search-input.component';
import { SelectInputComponent } from '../../../core/components/select-input/select-input.component';
import { SelectInputOptionDirective } from '../../../core/directives/select-input-option.directive';

@Component({
  selector: 'hq-client-details-search-filter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SearchInputComponent,
    SelectInputComponent,
    SelectInputOptionDirective,
  ],
  templateUrl: './client-details-search-filter.component.html',
})
export class ClientDetailsSearchFilterComponent {
  constructor(public clientDetailService: ClientDetailsService) {}
}
