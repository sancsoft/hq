import { Period } from '../../enums/period';
import { ProjectStatus } from '../../enums/project-status';
import { PagedRequestV1 } from '../common/paged-request-v1';
import { PagedResponseV1 } from '../common/paged-response-v1';
import { SortDirection } from '../common/sort-direction';

export interface GetPSRRequestV1 extends PagedRequestV1 {
  search?: string | null;
  id?: string | null;
  clientId?: string;
  projectId?: string;
  sortBy?: SortColumn;
  projectManagerId?: string | null;
  sortDirection?: SortDirection;
  isSubmitted?: boolean | null;
  startDate?: Date | null;
  endDate?: Date | null;
  period?: Period | null;
}

export enum SortColumn {
  StartDate = 1,
  EndDate = 2,
  ChargeCode = 3,
  ProjectName = 4,
  ClientName = 5,
  ProjectManagerName = 6,
  Status = 7,
  BookingPeriod = 8,
  BookingStartDate = 9,
  BookingEndDate = 10,
  TotalHours = 11,
  TotalAvailableHours = 12,
  ThisHours = 13,
  ThisPendingHours = 14,
  LastHours = 15,
  BookingHours = 16,
  BookingAvailableHours = 17,
  TotalPercentComplete = 18,
  BookingPercentComplete = 19,
  SummaryHoursTotal = 20,
  SummaryHoursAvailable = 21,
  SummaryPercentComplete = 22,
}

export interface GetPSRRecordV1 {
  id: string;
  chargeCode?: string;
  clientId: string;
  clientName: string;
  projectName: string;
  projectId: string;
  report?: string;
  projectManagerId?: string | null;
  projectManagerName?: string;
  totalHours: number;
  totalAvailableHours?: number;
  thisHours: number;
  thisPendingHours: number;
  bookingHours: number;
  bookingAvailableHours: number;
  status: ProjectStatus;
  totalPercentComplete?: number;
  bookingPercentComplete?: number;
  startDate: Date;
  endDate: Date;
  bookingStartDate: Date;
  bookingEndDate: Date;
  totalStartDate?: Date;
  totalEndDate?: Date;
  bookingPeriod: Period;
  lastId?: string;
  lastHours?: number;
  submittedAt?: Date | null;
  isLate: boolean;
  summaryHoursTotal: number;
  summaryHoursAvailable: number;
  summaryPercentComplete: number;
  isCurrentPsrPeriod: boolean;
}

export interface GetPSRRecordsV1 {
  records: [GetPSRRecordV1];
  total: number | null;
}

export interface GetPSRV1 extends PagedResponseV1<GetPSRRecordV1> {}
