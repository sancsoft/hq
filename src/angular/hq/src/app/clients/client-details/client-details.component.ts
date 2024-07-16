import { ClientDetailsSearchFilterComponent } from './client-details-search-filter/client-details-search-filter.component';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ClientDetailsSummaryComponent } from './client-details-summary/client-details-summary.component';
import { TabComponent } from '../../core/components/tab/tab.component';

@Component({
  selector: 'hq-client-details',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ClientDetailsSummaryComponent,
    ClientDetailsSearchFilterComponent,
    TabComponent,
  ],
  templateUrl: './client-details.component.html',
})
export class ClientDetailsComponent {}
