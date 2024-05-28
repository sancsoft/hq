import { PagedRequestV1 } from '../common/paged-request-v1';
import { PagedResponseV1 } from '../common/paged-response-v1';
import { SortDirection } from '../common/sort-direction';

export interface GetPSRRequestV1 extends PagedRequestV1 {
  search?: string | null;
  id?: string | null;
  clientId?: string;
  sortBy?: SortColumn;
  projectManagerId?: string | null;
  sortDirection?: SortDirection;
}

export enum SortColumn {
  ChargeCode = 1,
  ClientName = 2,
  ProjectName = 3,
  ProjectManagerName = 4,
  TotalHours = 5,
  HoursAvailable = 6,
  Status = 7,
  PercentComplete = 8,
}

export interface GetPSRRecordV1 {
  id: string;
  startDate: Date;
  endDate: Date;
  chargeCode: string;
  clientName: string;
  projectName: string;
  projectManagerName: string;
  totalHours: number;
  status: number;
  percentComplete: number;
  lastHours: number;
  LastId: string;
  hoursAvailable: number;
  PercentComplete: number;
}

export interface GetPSRRecordsV1 {
  records: [GetPSRRecordV1];
  total: number | null;
}

export interface GetPSRV1 extends PagedResponseV1<GetPSRRecordV1> {}
