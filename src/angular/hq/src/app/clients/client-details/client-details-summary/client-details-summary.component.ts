import { Component } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap, catchError, map, shareReplay } from 'rxjs/operators';
import { HQService } from '../../../services/hq.service';
import { GetClientRecordV1 } from '../../../models/clients/get-client-v1';
import { APIError } from '../../../errors/apierror';
import { CommonModule } from '@angular/common';
import { ErrorDisplayComponent } from '../../../errors/error-display/error-display.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GetClientInvoiceSummaryV1Response } from '../../../models/clients/get-client-invoice-summary-v1';
@Component({
  selector: 'hq-client-details-summary',
  standalone: true,
  imports: [CommonModule, ErrorDisplayComponent, RouterLink],
  templateUrl: './client-details-summary.component.html',
})
export class ClientDetailsSummaryComponent {
  client$: Observable<GetClientRecordV1 | null>;
  clientInvoiceSummary$: Observable<GetClientInvoiceSummaryV1Response>;
  apiErrors: string[] = [];

  constructor(
    private hqService: HQService,
    private route: ActivatedRoute,
  ) {
    const clientId$ = this.route.paramMap.pipe(map((t) => t.get('clientId')!));

    this.client$ = clientId$.pipe(
      switchMap((clientId) => this.hqService.getClientsV1({ id: clientId })),
      map((t) => t.records[0]),
      catchError((error: unknown) => {
        if (error instanceof APIError) {
          this.apiErrors = error.errors;
        } else {
          this.apiErrors = ['An unexpected error has occurred.'];
        }

        return of(null);
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.clientInvoiceSummary$ = clientId$.pipe(
      switchMap((clientId) =>
        this.hqService.getClientInvoiceSummaryV1({ id: clientId }),
      ),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
  }

  private defaultClientSummaryRecord: GetClientRecordV1 = {
    id: '',
    name: '',
    officialName: '',
    billingEmail: '',
    hourlyRate: 0.0,
  };
}
