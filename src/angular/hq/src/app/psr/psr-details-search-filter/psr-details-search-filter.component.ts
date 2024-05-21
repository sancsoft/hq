import { CommonModule } from '@angular/common';
import { PsrService } from './../psr-service';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'hq-psr-details-search-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './psr-details-search-filter.component.html'
})
export class PsrDetailsSearchFilterComponent {
  constructor(public psrService: PsrService) { }

}