import { Component } from '@angular/core';
import { PsrService } from '../psr-service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'hq-psr-list-search-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './psr-list-search-filter.component.html'
})
export class PsrListSearchFilterComponent {
  constructor(public psrService: PsrService) { }
}
