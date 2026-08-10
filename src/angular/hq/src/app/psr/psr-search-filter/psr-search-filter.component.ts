import { PsrService } from './../psr-service';
import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'hq-psr-search-filter',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './psr-search-filter.component.html',
})
export class PsrSearchFilterComponent {
  constructor(public psrService: PsrService) {}
}
