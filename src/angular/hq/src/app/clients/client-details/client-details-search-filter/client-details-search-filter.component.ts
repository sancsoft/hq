import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ClientDetailsService } from '../../client-details.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'hq-client-details-search-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './client-details-search-filter.component.html',
})
export class ClientDetailsSearchFilterComponent {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public clientDetailService: ClientDetailsService,
  ) {}
}
