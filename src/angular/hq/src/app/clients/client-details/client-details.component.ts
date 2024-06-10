import { ClientDetailsSearchFilterComponent } from './client-details-search-filter/client-details-search-filter.component';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterModule, RouterOutlet } from '@angular/router';
import { firstValueFrom, switchMap, of, Observable, catchError, map } from 'rxjs';
import { HQService } from '../../services/hq.service';
import { GetClientRecordV1 } from '../../models/clients/get-client-v1';
import { APIError } from '../../errors/apierror';
import { ClientDetailsSummaryComponent } from './client-details-summary/client-details-summary.component';
import { GetProjectRecordV1, GetProjectRecordsV1 } from '../../models/projects/get-project-v1';
import { ClientDetailsService } from '../client-details.service';

@Component({
  selector: 'hq-client-details',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ClientDetailsSummaryComponent, ClientDetailsSearchFilterComponent],
  templateUrl: './client-details.component.html',
  // providers: [ClientDetailsService]
})
export class ClientDetailsComponent {

}
