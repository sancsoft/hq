import { ProjectStatus } from '../../clients/client-details.service';
import { Period } from '../../projects/project-create/project-create.component';
import { PagedRequestV1 } from '../common/paged-request-v1';
import { PagedResponseV1 } from '../common/paged-response-v1';
import { SortDirection } from '../common/sort-direction';

export interface GetProjectRequestV1 extends PagedRequestV1 {
  search?: string | null;
  id?: string;
  clientId?: string | null;
  sortBy: SortColumn;
  sortDirection: SortDirection;
}

export enum SortColumn {
  ProjectName = 1,
  ProjectManagerName = 2,
  StartDate = 3,
  EndDate = 4,
  ChargeCode = 5,
  ClientName = 6,
  Status = 7,
}

export interface GetProjectRecordV1 {
  id: string;
  projectNumber: string;
  chargeCode: string | null;
  clientId: string;
  clientName: string;
  projectManagerId: number;
  projectManagerName: string | null;
  name: string;
  quoteId: number | null;
  quoteNumber: string | null;
  hourlyRate: number;
  bookingHours: number;
  bookingPeriod: Period;
  startDate: Date;
  endDate: Date;
  status: ProjectStatus;
  billingEmail: string;
  officialName: string;
}

export interface GetProjectRecordsV1 {
  records: [GetProjectRecordV1];
  total: number | null;
}

export interface GetProjectResponseV1
  extends PagedResponseV1<GetProjectRecordV1> {}
