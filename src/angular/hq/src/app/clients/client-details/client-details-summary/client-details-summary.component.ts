import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';
import { HQService } from '../../../services/hq.service';
import { GetClientRecordV1 } from '../../../models/clients/get-client-v1';
import { APIError } from '../../../errors/apierror';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'hq-client-details-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-details-summary.component.html',
})
export class ClientDetailsSummaryComponent implements OnInit {
  clientId?: string;
  client?: Observable<GetClientRecordV1 | null>;
  apiErrors: string[] = [];

  constructor(private hqService: HQService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.client = this.route.paramMap.pipe(
      switchMap((params) => {
        this.clientId = params.get('clientId') || undefined;
        if (this.clientId) {
          const request = { id: this.clientId };
          return this.hqService.getClientsV1(request).pipe(
            map((response) => response.records[0] || null),
            catchError((error) => {
              if (error instanceof APIError) {
                this.apiErrors = error.errors;
              } else {
                this.apiErrors = ['An unexpected error has occurred.'];
              }
              return of(null);
            })
          );
        } else {
          return of(null);
        }
      })
    );
  }
}
