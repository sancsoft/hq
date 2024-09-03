import { UpsertStaffMemberResponseV1 } from './../models/staff-members/upsert-staff-member-v1';
import {
  SubmitPSRRequestV1,
  SubmitPSRResponseV1,
} from './../models/PSR/submit-psr';
import {
  updatePSRTimeRequestV1,
  UpdatePSRTimeResponseV1,
} from './../models/PSR/update-psr-time-v1';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  GetClientRequestV1,
  GetClientResponseV1,
} from '../models/clients/get-client-v1';
import { AppSettingsService } from '../app-settings.service';
import { catchError, map, switchMap, throwError } from 'rxjs';
import {
  UpsertClientRequestV1,
  UpsertClientResponseV1,
} from '../models/clients/upsert-client-v1';
import {
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
  GetInvoicesRequestV1,
} from '../models/Invoices/get-invoices-v1';
import { GetPSRRecordsV1, GetPSRRequestV1 } from '../models/PSR/get-PSR-v1';
import {
  GetPSRTimeRecordsV1,
  GetPSRTimeRequestV1,
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
  UpsertHolidayRequestV1,
  UpsertHolidayResponseV1,
} from '../models/holiday/upsert-holiday-v1';
import {
  GetHolidayV1Request,
  GetHolidayV1Response,
} from '../models/holiday/get-holiday-v1';
import {
  UpsertProjectRequestV1,
  UpsertProjectResponsetV1,
} from '../models/projects/upsert-project-v1';
import {
  UpsertQuoteRequestV1,
  UpsertQuoteResponsetV1,
} from '../models/quotes/upsert-quote-v1';
import {
  GetUsersRequestV1,
  GetUsersResponseV1,
} from '../models/users/get-users-v1';
import {
  UpsertUserRequestV1,
  UpsertUserResponseV1,
} from '../models/users/upsert-users-v1';

import {
  updatePSRmarkDownRequestV1,
  UpdatePSRMarkDownResponseV1,
} from '../models/PSR/update-psr-markdown';
import {
  UnapprovePSRTimeRequestV1,
  UnapprovePSRTimeResponseV1,
} from '../models/PSR/unapprove-psrtime-v1';
import { UpsertStaffMemberRequestV1 } from '../models/staff-members/upsert-staff-member-v1';
import {
  UpsertChargeCodesRequestV1,
  UpsertChargeCodesResponseV1,
} from '../models/charge-codes/upsert-chargecodes';
// import {
//   UploadQuotePDFRequestV1,
//   UploadQuotePDFResponseV1,
// } from '../models/quotes/upload-quotePDF-v1';
import {
  GetProjectActivitiesResponseV1,
  GetProjectActivityRequestV1,
} from '../models/projects/get-project-activity-v1';
import {
  AddProjectMemberRequestV1,
  AddProjectMemberResponseV1,
} from '../models/projects/add-project-member-v1';
import {
  RemoveProjectMemberRequestV1,
  RemoveProjectMemberResponseV1,
} from '../models/projects/remove-project-member-v1';
import {
  UpsertProjectActivityResponseV1,
  UpsertProjectActivityRequestV1,
} from '../models/projects/upsert-project-activity-v1';
import {
  DeleteProjectActivityV1Request,
  DeleteProjectActivityV1Response,
} from '../models/projects/delete-project-activity-v1';
import {
  GetTimeRecordsV1,
  GetTimeRequestV1,
} from '../models/times/get-time-v1';
import {
  GetClientInvoiceSummaryV1Request,
  GetClientInvoiceSummaryV1Response,
} from '../models/clients/get-client-invoice-summary-v1';
import {
  updateTimeRequestV1,
  UpdateTimeResponseV1,
} from '../models/times/update-time-v1';
import {
  GetDashboardTimeV1Request,
  GetDashboardTimeV1Response,
} from '../models/staff-dashboard/get-dashboard-time-v1';
import {
  DeleteTimeV1Request,
  DeleteTimeV1Response,
} from '../models/times/delete-time-v1';
import {
  SubmitTimeResponseV1,
  SubmitTimesRequestV1,
} from '../models/times/submit-times-v1';
import {
  GetPrevPSRRequestV1,
  GetPrevPsrResponseV1,
} from '../models/PSR/get-previous-PSR-v1';
import {
  GetPlanRequestV1,
  GetPlanResponseV1,
} from '../models/Plan/get-plan-v1';
import {
  UpsertPlanRequestV1,
  UpsertPlanResponseV1,
} from '../models/Plan/upsert-plan-v1';
import {
  GetStatusRequestV1,
  GetStatusResponseV1,
} from '../models/status/get-status-v1';
import {
  GetPrevPlanRequestV1,
  GetPrevPlanResponseV1,
} from '../models/Plan/get-previous-PSR-v1';
import {
  UpsertStatusRequestV1,
  UpsertStatusResponseV1,
} from '../models/status/upsert-status-v1';
import {
  getPointsRequestV1,
  getPointsResponseV1,
} from '../models/Points/get-points-v1';
import {
  upsertPointsRequestV1,
  upsertPointsResponseV1,
} from '../models/Points/upsert-points-V1';
import {
  GetPointsSummaryRequestV1,
  GetPointsSummaryResponseV1,
} from '../models/Points/get-points-summary-v1';
@Injectable({
  providedIn: 'root',
})
export class HQService {
  constructor(
    private http: HttpClient,
    private appSettings: AppSettingsService,
  ) {}
  // Clients
  getClientsV1(request: Partial<GetClientRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<GetClientResponseV1>(
          `${apiUrl}/v1/Clients/GetClientsV1`,
          request,
        ),
      ),
    );
  }

  upsertClientV1(request: Partial<UpsertClientRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<UpsertClientResponseV1>(
          `${apiUrl}/v1/Clients/UpsertClientV1`,
          request,
        ),
      ),
    );
  }

  // Projects
  getProjectsV1(request: Partial<GetProjectRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<GetProjectResponseV1>(
          `${apiUrl}/v1/Projects/GetProjectsV1`,
          request,
        ),
      ),
    );
  }
  getProjectV1(id: string) {
    return this.getProjectsV1({ id: id });
  }

  // Quotes
  getQuotesV1(request: Partial<GetQuotesRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<GetQuotesRecordsV1>(
          `${apiUrl}/v1/Quotes/GetQuotesV1`,
          request,
        ),
      ),
    );
  }

  // Services
  getServicesV1(request: Partial<GetServicesRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<GetServicesRecordsV1>(
          `${apiUrl}/v1/ServicesAgreement/GetServicesAgreementV1`,
          request,
        ),
      ),
    );
  }

  // Invoices
  getInvoicesV1(request: Partial<GetInvoicesRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<GetInvoicesRecordsV1>(
          `${apiUrl}/v1/Invoices/GetInvoicesV1`,
          request,
        ),
      ),
    );
  }

  getPSRV1(request: Partial<GetPSRRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http
          .post<GetPSRRecordsV1>(
            `${apiUrl}/v1/ProjectStatusReports/GetProjectStatusReportsV1`,
            request,
          )
          .pipe(
            catchError((error) => {
              console.error('Error in getPSRV1:', error);
              return throwError(() => error); 
            }),
          ),
      ),
    );
  }

  getPrevPSRV1(request: Partial<GetPrevPSRRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<GetPrevPsrResponseV1>(
          `${apiUrl}/v1/ProjectStatusReports/GetPreviousProjectStatusReportsV1`,
          request,
        ),
      ),
    );
  }

  getProjectPSRV1(id: string) {
    return this.getPSRV1({ projectId: id });
  }

  getPSRTimeV1(request: Partial<GetPSRTimeRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<GetPSRTimeRecordsV1>(
          `${apiUrl}/v1/ProjectStatusReports/GetProjectStatusReportTimeV1`,
          request,
        ),
      ),
    );
  }

  approvePSRTimeV1(request: Partial<ApprovePSRTimeRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<ApprovePSRTimeResponseV1>(
          `${apiUrl}/v1/ProjectStatusReports/ApproveProjectStatusReportTimeRequestV1`,
          request,
        ),
      ),
    );
  }

  unapprovePSRTimeV1(request: Partial<UnapprovePSRTimeRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<UnapprovePSRTimeResponseV1>(
          `${apiUrl}/v1/ProjectStatusReports/UnapproveProjectStatusReportTimeV1`,
          request,
        ),
      ),
    );
  }

  rejectPSRTimeV1(request: Partial<RejectPSRTimeRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<RejectPSRTimeResponseV1>(
          `${apiUrl}/v1/ProjectStatusReports/RejectProjectStatusReportTimeV1`,
          request,
        ),
      ),
    );
  }

  updatePSRTimeV1(request: Partial<updatePSRTimeRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<UpdatePSRTimeResponseV1>(
          `${apiUrl}/v1/ProjectStatusReports/UpdateProjectStatusReportTimeV1`,
          request,
        ),
      ),
    );
  }

  getChargeCodeseV1(request: Partial<GetChargeCodesRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<GetChargeCodesResponseV1>(
          `${apiUrl}/v1/ChargeCodes/GetChargeCodesV1`,
          request,
        ),
      ),
    );
  }

  getStaffMembersV1(request: Partial<GetStaffV1Request>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<GetStaffV1Response>(
          `${apiUrl}/v1/Staff/GetStaffV1`,
          request,
        ),
      ),
    );
  }
  getHolidayV1(request: Partial<GetHolidayV1Request>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<GetHolidayV1Response>(
          `${apiUrl}/v1/Holiday/GetHolidayV1`,
          request,
        ),
      ),
    );
  }
  upsertProjectV1(request: Partial<UpsertProjectRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<UpsertProjectResponsetV1>(
          `${apiUrl}/v1/Projects/UpsertProjectV1`,
          request,
        ),
      ),
    );
  }

  upsertQuoteV1(request: Partial<UpsertQuoteRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<UpsertQuoteResponsetV1>(
          `${apiUrl}/v1/Quotes/UpsertQuotesV1`,
          request,
        ),
      ),
    );
  }

  getUsersV1(request: Partial<GetUsersRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<GetUsersResponseV1>(
          `${apiUrl}/v1/Users/GetUsersV1`,
          request,
        ),
      ),
    );
  }
  updateProjectStatusReportMarkdownV1(
    request: Partial<updatePSRmarkDownRequestV1>,
  ) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<UpdatePSRMarkDownResponseV1>(
          `${apiUrl}/v1/ProjectStatusReports/UpdateProjectStatusReportMarkdownV1`,
          request,
        ),
      ),
    );
  }

  upsertUsersV1(request: Partial<UpsertUserRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<UpsertUserResponseV1>(
          `${apiUrl}/v1/Users/UpsertUserV1`,
          request,
        ),
      ),
    );
  }

  upsertStaffV1(request: Partial<UpsertStaffMemberRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<UpsertStaffMemberResponseV1>(
          `${apiUrl}/v1/Staff/UpsertStaffV1
          `,
          request,
        ),
      ),
    );
  }
  upsertHolidayV1(request: Partial<UpsertHolidayRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<UpsertHolidayResponseV1>(
          `${apiUrl}/v1/Holiday/UpsertHolidayV1
          `,
          request,
        ),
      ),
    );
  }
  upsertChargecodesV1(request: Partial<UpsertChargeCodesRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<UpsertChargeCodesResponseV1>(
          `${apiUrl}/v1/ChargeCodes/UpsertChargeCodesV1
          `,
          request,
        ),
      ),
    );
  }
  upsertProjectActivityV1(request: Partial<UpsertProjectActivityRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<UpsertProjectActivityResponseV1>(
          `${apiUrl}/v1/Projects/UpsertProjectActivityV1
          `,
          request,
        ),
      ),
    );
  }
  deleteProjectActivityV1(request: Partial<DeleteProjectActivityV1Request>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<DeleteProjectActivityV1Response>(
          `${apiUrl}/v1/Projects/DeleteProjectActivityV1`,
          request,
        ),
      ),
    );
  }

  addProjectMemberV1(request: Partial<AddProjectMemberRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<AddProjectMemberResponseV1>(
          `${apiUrl}/v1/Projects/AddProjectMemberV1
          `,
          request,
        ),
      ),
    );
  }
  removeProjectMemberV1(request: Partial<RemoveProjectMemberRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<RemoveProjectMemberResponseV1>(
          `${apiUrl}/v1/Projects/RemoveProjectMemberV1`,
          request,
        ),
      ),
    );
  }
  submitProjectStatusReportV1(request: Partial<SubmitPSRRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<SubmitPSRResponseV1>(
          `${apiUrl}/v1/ProjectStatusReports/SubmitProjectStatusReportV1`,
          request,
        ),
      ),
    );
  }

  getprojectActivitiesV1(request: Partial<GetProjectActivityRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<GetProjectActivitiesResponseV1>(
          `${apiUrl}/v1/Projects/GetProjectActivitiesV1`,
          request,
        ),
      ),
    );
  }

  getTimesV1(request: Partial<GetTimeRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<GetTimeRecordsV1>(
          `${apiUrl}/v1/TimeEntries/GetTimesV1`,
          request,
        ),
      ),
    );
  }
  upsertTimeV1(request: Partial<updateTimeRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<UpdateTimeResponseV1>(
          `${apiUrl}/v1/TimeEntries/UpsertTimeV1`,
          request,
        ),
      ),
    );
  }
  submitTimesV1(request: Partial<SubmitTimesRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<SubmitTimeResponseV1>(
          `${apiUrl}/v1/TimeEntries/SubmitTimesV1`,
          request,
        ),
      ),
    );
  }
  deleteTimeV1(request: Partial<DeleteTimeV1Request>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<DeleteTimeV1Response>(
          `${apiUrl}/v1/TimeEntries/DeleteTimeV1`,
          request,
        ),
      ),
    );
  }

  getClientInvoiceSummaryV1(
    request: Partial<GetClientInvoiceSummaryV1Request>,
  ) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<GetClientInvoiceSummaryV1Response>(
          `${apiUrl}/v1/Clients/GetClientInvoiceSummaryV1`,
          request,
        ),
      ),
    );
  }

  getDashboardTimeV1(request: Partial<GetDashboardTimeV1Request>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<GetDashboardTimeV1Response>(
          `${apiUrl}/v1/TimeEntries/GetDashboardTimeV1`,
          request,
        ),
      ),
    );
  }

  exportTimesV1(request: Partial<object>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.request('post', `${apiUrl}/v1/TimeEntries/ExportTimesV1`, {
          body: request,
          responseType: 'blob',
          observe: 'response',
        }),
      ),
      map((response) => ({
        file: response.body,
        fileName: (response.headers.get('content-disposition') ?? '')
          .split(';')[1]
          .split('filename')[1]
          .split('=')[1]
          .trim(),
      })),
    );
  }
  getPlanV1(request: Partial<GetPlanRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<GetPlanResponseV1>(
          `${apiUrl}/v1/Plan/GetPlanV1`,
          request,
        ),
      ),
    );
  }
  upsertPlanV1(request: Partial<UpsertPlanRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<UpsertPlanResponseV1>(
          `${apiUrl}/v1/Plan/UpsertPlanV1`,
          request,
        ),
      ),
    );
  }

  getStatusV1(request: Partial<GetStatusRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<GetStatusResponseV1>(
          `${apiUrl}/v1/Status/GetStatusV1`,
          request,
        ),
      ),
    );
  }
  upsertStatus(request: Partial<UpsertStatusRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<UpsertStatusResponseV1>(
          `${apiUrl}/v1/Status/UpsertStatusV1`,
          request,
        ),
      ),
    );
  }

  getPreviousPlanV1(request: Partial<GetPrevPlanRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<GetPrevPlanResponseV1>(
          `${apiUrl}/v1/Plan/PreviousPlanV1`,
          request,
        ),
      ),
    );
  }

  getPlanningPointsV1(request: Partial<getPointsRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<getPointsResponseV1>(
          `${apiUrl}/v1/Point/GetPointsV1`,
          request,
        ),
      ),
    );
  }
  upsertPlanningPointsV1(request: Partial<upsertPointsRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<upsertPointsResponseV1>(
          `${apiUrl}/v1/Point/UpsertPointV1`,
          request,
        ),
      ),
    );
  }

  uploadQuotePDFV1(quoteId: string, file: File) {
    const formData = new FormData();
    formData.append('id', quoteId);
    formData.append('file', file);

    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<void>(`${apiUrl}/v1/Quotes/UploadQuotePDFV1`, formData),
      ),
    );
  }

  getQuotePDFV1(request: Partial<object>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.request('post', `${apiUrl}/v1/Quotes/GetQuotePDFV1`, {
          body: request,
          responseType: 'blob',
          observe: 'response',
        }),
      ),
      map((response) => ({
        file: response.body,
        fileName: (response.headers.get('content-disposition') ?? '')
          .split(';')[1]
          .split('filename')[1]
          .split('=')[1]
          .trim(),
      })),
    );
  }

  getPointsSummaryV1(request: Partial<GetPointsSummaryRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap((apiUrl) =>
        this.http.post<GetPointsSummaryResponseV1>(
          `${apiUrl}/v1/Point/GetPointSummaryV1`,
          request,
        ),
      ),
    );
  }
}
