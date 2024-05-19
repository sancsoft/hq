import { PagedRequestV1 } from '../common/paged-request-v1';
import { PagedResponseV1 } from '../common/paged-response-v1';
import { SortDirection } from '../common/sort-direction';

export interface GetInvoicesRequestV1 extends PagedRequestV1 {
  search?: string | null;
  id?: string;
  clientId?: string;
  sortBy: SortColumn;
  sortDirection: SortDirection;
}

export enum SortColumn {
  CreatedAt = 1,
  Name = 2,
  HourlyRate = 3,
}

export interface GetInvoicesRecordV1 {
  id: string;
  clientName: string;
  date: Date;
  invoiceNumber: string;
  total: number;
  TotalApprovedHours: number;
}

export interface GetInvoicesRecordsV1 {
  records: [GetInvoicesRecordV1];
  total: number | null;
}

export interface GetQuotesInvoicesV1
  extends PagedResponseV1<GetInvoicesRecordV1> {}
