import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  GetClientRequestV1,
  GetClientResponseV1,
} from '../models/clients/get-client-v1';
import { AppSettingsService } from '../app-settings.service';
import { catchError, switchMap, throwError } from 'rxjs';
import {
  UpsertClientRequestV1,
  UpsertClientResponseV1,
} from '../models/clients/upsert-client-v1';
import { APIError } from '../errors/apierror';
import {
  GetProjectRecordsV1,
  GetProjectRequestV1,
  GetProjectResponseV1,
} from '../models/projects/get-project-v1';
import {
  GetQuotesRecordsV1,
  GetQuotesRequestV1,
} from '../models/quotes/get-quotes-v1';
import {
  GetServicesRecordsV1,
  GetServicesRequestV1,
} from '../models/Services/get-services-v1';
import {
  GetInvoicesRecordsV1,
  GetInvoicesRecordV1,
  GetInvoicesRequestV1,
} from '../models/Invoices/get-invoices-v1';

@Injectable({
  providedIn: 'root',
})
export class HQService {
  constructor(
    private http: HttpClient,
    private appSettings: AppSettingsService
  ) {}
  // Clients
  getClientsV1(request: Partial<GetClientRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<GetClientResponseV1>(
          `${apiUrl}/v1/Clients/GetClientsV1`,
          request
        )
      )
    );
  }

  upsertClientV1(request: Partial<UpsertClientRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<UpsertClientResponseV1>(
          `${apiUrl}/v1/Clients/UpsertClientV1`,
          request
        )
      ),
      catchError((err: HttpErrorResponse) => {
        if (err.status == 400) {
          return throwError(() => new APIError(err.error));
        }

        throw err;
      })
    );
  }

  // Projects
  getProjectsV1(request: Partial<GetProjectRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<GetProjectRecordsV1>(
          `${apiUrl}/v1/Projects/GetProjectsV1`,
          request
        )
      )
    );
  }

  // Quotes
  getQuotesV1(request: Partial<GetQuotesRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<GetQuotesRecordsV1>(
          `${apiUrl}/v1/Quotes/GetQuotesV1`,
          request
        )
      )
    );
  }

  // Quotes
  getServicesV1(request: Partial<GetServicesRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<GetServicesRecordsV1>(
          `${apiUrl}/v1/ServicesAgreement/GetServicesAgreementV1`,
          request
        )
      )
    );
  }

  // Invoices
  getInvoicesV1(request: Partial<GetInvoicesRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<GetInvoicesRecordsV1>(
          `${apiUrl}/v1/Invoices/GetInvoicesV1`,
          request
        )
      )
    );
  }
}
