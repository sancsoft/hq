import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PsrListService } from '../psrlist/services/pstlistService';

@Component({
  selector: 'hq-psr-list-search-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './psr-list-search-filter.component.html'
})
export class PsrListSearchFilterComponent {
  constructor(public psrListService: PsrListService) {}

}
