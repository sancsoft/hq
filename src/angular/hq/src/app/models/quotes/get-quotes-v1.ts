import { PagedRequestV1 } from '../common/paged-request-v1';
import { PagedResponseV1 } from '../common/paged-response-v1';
import { SortDirection } from '../common/sort-direction';

export interface GetQuotesRequestV1 extends PagedRequestV1 {
  search?: string | null;
  id?: string;
  clientId?: string;
  sortBy: SortColumn;
  sortDirection: SortDirection;
}

export enum SortColumn {
  QuoteName = 1,
  ClientName = 2,
  Value = 3,
  Status = 4,
}

export interface GetQuotesRecordV1 {
  id: string;
  QuoteNumber: number;
  clientId: string;
  clientName: string;
  name: string;
  quoteNumber: string | null;
  chargeCode: string;
  date: Date | null;
  value: number | null;
  status: string | null;
}

export interface GetQuotesRecordsV1 {
  records: [GetQuotesRecordV1];
  total: number | null;
}

export interface GetQuotesResponseV1
  extends PagedResponseV1<GetQuotesRecordV1> {}
