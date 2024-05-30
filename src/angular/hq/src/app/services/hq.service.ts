import {
  updatePSRTimeRequestV1,
  UpdatePSRTimeResponseV1,
} from './../models/PSR/update-psr-time-v1';
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
import { GetPSRRecordsV1, GetPSRRequestV1 } from '../models/PSR/get-PSR-v1';
import {
  GetPSRTimeRecordsV1,
  GetPSRTimeRequestV1,
  GetPSRTimeV1,
} from '../models/PSR/get-psr-time-v1';
import {
  ApprovePSRTimeRequestV1,
  ApprovePSRTimeResponseV1,
} from '../models/PSR/approve-psr-time-v1';
import {
  RejectPSRTimeRequestV1,
  RejectPSRTimeResponseV1,
} from '../models/PSR/reject-psr-time-v1';
import {
  GetChargeCodesRequestV1,
  GetChargeCodesResponseV1,
} from '../models/charge-codes/get-chargecodes-v1';
import {
  GetStaffV1Request,
  GetStaffV1Response,
} from '../models/staff-members/get-staff-member-v1';
import {
  UpsertProjectRequestV1,
  UpsertProjectResponsetV1,
} from '../models/projects/upsert-project-v1';
import {
  UpsertQuoteRequestV1,
  UpsertQuoteResponsetV1,
} from '../models/quotes/upsert-quote-v1';

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

  // Services
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

  getPSRV1(request: Partial<GetPSRRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<GetPSRRecordsV1>(
          `${apiUrl}/v1/ProjectStatusReports/GetProjectStatusReportsV1`,
          request
        )
      )
    );
  }

  getPSRTimeV1(request: Partial<GetPSRTimeRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<GetPSRTimeRecordsV1>(
          `${apiUrl}/v1/ProjectStatusReports/GetProjectStatusReportTimeV1`,
          request
        )
      )
    );
  }

  approvePSRTimeV1(request: Partial<ApprovePSRTimeRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<ApprovePSRTimeResponseV1>(
          `${apiUrl}/v1/ProjectStatusReports/ApproveProjectStatusReportTimeRequestV1`,
          request
        )
      )
    );
  }

  rejectPSRTimeV1(request: Partial<RejectPSRTimeRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<RejectPSRTimeResponseV1>(
          `${apiUrl}/v1/ProjectStatusReports/RejectProjectStatusReportTimeV1`,
          request
        )
      )
    );
  }

  updatePSRTimeV1(request: Partial<updatePSRTimeRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<UpdatePSRTimeResponseV1>(
          `${apiUrl}/v1/ProjectStatusReports/UpdateProjectStatusReportTimeV1`,
          request
        )
      )
    );
  }

  getChargeCodeseV1(request: Partial<GetChargeCodesRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<GetChargeCodesResponseV1>(
          `${apiUrl}/v1/ChargeCodes/GetChargeCodesV1`,
          request
        )
      )
    );
  }

  getStaffMembersV1(request: Partial<GetStaffV1Request>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<GetStaffV1Response>(
          `${apiUrl}/v1/Staff/GetStaffV1`,
          request
        )
      )
    );
  }

  upsertProjectV1(request: Partial<UpsertProjectRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<UpsertProjectResponsetV1>(
          `${apiUrl}/v1/Projects/UpsertProjectV1`,
          request
        )
      )
    );
  }

  upsertQuoteV1(request: Partial<UpsertQuoteRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<UpsertQuoteResponsetV1>(
          `${apiUrl}/v1/Quotes/UpsertQuotesV1`,
          request
        )
      )
    );
  }
}
// UpdateProjectStatusReportTimeV1
