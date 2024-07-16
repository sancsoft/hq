import { ClientDetailsSearchFilterComponent } from './client-details-search-filter/client-details-search-filter.component';
import { Component } from '@angular/core';
import {
  ActivatedRoute,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { ClientDetailsSummaryComponent } from './client-details-summary/client-details-summary.component';
import { map, Subscription } from 'rxjs';
import { ClientDetailsService } from './client-details.service';
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
  providers: [ClientDetailsService],
})
export class ClientDetailsComponent {
  private subscriptions: Subscription[] = [];

  constructor(
    private clientDetailsService: ClientDetailsService,
    private route: ActivatedRoute,
  ) {
    const clientId$ = route.paramMap.pipe(map((t) => t.get('clientId')));
    this.clientDetailsService.subscribeClientId(clientId$);
  }
}
