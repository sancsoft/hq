import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ClientListService } from './../../Services/ClientListService';
import { Component } from '@angular/core';
import { SearchInputComponent } from '../../../core/components/search-input/search-input.component';

@Component({
  selector: 'hq-search-filter-client-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SearchInputComponent,
  ],
  templateUrl: './search-filter-client-list.component.html',
})
export class SearchFilterClientListComponent {
  constructor(public ClientListService: ClientListService) {}
}
