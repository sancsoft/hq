import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ClientListService } from './../../Services/ClientListService';
import { Component } from '@angular/core';

@Component({
  selector: 'hq-search-filter-client-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './search-filter-client-list.component.html'
})
export class SearchFilterClientListComponent {
  constructor(public ClientListService: ClientListService) {
    
  }
}