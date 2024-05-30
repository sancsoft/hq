import { PsrService } from './../psr-service';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'hq-psr-search-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './psr-search-filter.component.html',
})
export class PsrSearchFilterComponent {
  constructor(public psrService: PsrService) {}
}
