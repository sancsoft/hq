import { ProjectStatus } from '../../enums/project-status';
import { PagedRequestV1 } from '../common/paged-request-v1';
import { PagedResponseV1 } from '../common/paged-response-v1';
import { SortDirection } from '../common/sort-direction';

export interface GetQuotesRequestV1 extends PagedRequestV1 {
  search?: string | null;
  id?: string;
  clientId?: string;
  sortBy: SortColumn;
  sortDirection: SortDirection;
  quoteStatus: ProjectStatus | null;
}

export enum SortColumn {
  QuoteName = 1,
  QuoteNumber = 2,
  ClientName = 3,
  ChargeCode = 4,
  Value = 5,
  Status = 6,
  Date = 7,
}

export interface GetQuotesRecordV1 {
  id: string;
  QuoteNumber: number;
  clientId: string;
  clientName: string;
  name: string;
  quoteNumber: number | null;
  chargeCode: string;
  date: string | null;
  value: number | null;
  status: ProjectStatus;
  hasPDF: boolean;
}

export interface GetQuotesRecordsV1 {
  records: [GetQuotesRecordV1];
  total: number | null;
}

export interface GetQuotesResponseV1
  extends PagedResponseV1<GetQuotesRecordV1> {}
