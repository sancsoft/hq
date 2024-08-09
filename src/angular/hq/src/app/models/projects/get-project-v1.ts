import { Period } from '../../enums/period';
import { ProjectStatus } from '../../enums/project-status';
import { ProjectType } from '../../enums/project-type';
import { PagedRequestV1 } from '../common/paged-request-v1';
import { PagedResponseV1 } from '../common/paged-response-v1';
import { SortDirection } from '../common/sort-direction';

export interface GetProjectRequestV1 extends PagedRequestV1 {
  search?: string | null;
  id?: string | null;
  clientId?: string | null;
  sortBy: SortColumn;
  projectManagerId: string | null;
  sortDirection: SortDirection;
  projectStatus?: ProjectStatus | null;
}

export enum SortColumn {
  ProjectName = 1,
  ProjectManagerName = 2,
  StartDate = 3,
  EndDate = 4,
  ChargeCode = 5,
  ClientName = 6,
  ProjectStatus = 7,
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

export interface GetProjectRecordV1 {
  id: string;
  projectNumber: number | null;
  chargeCode: string | null;
  clientId: string;
  clientName: string;
  projectManagerId: string | null;
  projectManagerName: string | null;
  name: string;
  quoteId: string | null;
  quoteNumber: string | null;
  hourlyRate: number;
  timeEntryMaxHours: number;
  bookingHours: number;
  bookingPeriod: Period;
  startDate: string;
  endDate: string;
  projectStatus: ProjectStatus;
  billingEmail: string;
  officialName: string;
  summaryHoursTotal: number;
  summaryHoursAvailable: number;
  summaryPercentComplete: number;
  bookingStartDate: Date;
  bookingEndDate: Date;
  totalStartDate?: Date;
  totalEndDate?: Date;
  totalPercentComplete?: number;
  bookingPercentComplete?: number;
  totalHours: number;
  type: ProjectType;
  billable: boolean;
  projectTotalHours: number | null;
  projectBookingHours: number | null;
}

export interface GetProjectResponseV1
  extends PagedResponseV1<GetProjectRecordV1> {}
