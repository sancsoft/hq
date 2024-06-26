import { PagedRequestV1 } from '../common/paged-request-v1';
import { PagedResponseV1 } from '../common/paged-response-v1';
import { SortDirection } from '../common/sort-direction';

export interface GetClientRequestV1 extends PagedRequestV1 {
  search?: string | null;
  id?: string;
  sortBy: SortColumn;
  sortDirection: SortDirection;
}

export enum SortColumn {
  CreatedAt = 1,
  Name = 2,
  HourlyRate = 3,
  BillingEmail = 4,
  OfficialName = 5,
}

export interface GetClientRecordV1 {
  id: string;
  name: string;
  officialName?: string;
  billingEmail?: string;
  hourlyRate?: number;
}

export interface GetClientResponseV1
  extends PagedResponseV1<GetClientRecordV1> {}
