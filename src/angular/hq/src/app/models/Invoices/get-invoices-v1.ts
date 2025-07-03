import { Period } from '../../enums/period';
import { PagedRequestV1 } from '../common/paged-request-v1';
import { PagedResponseV1 } from '../common/paged-response-v1';
import { SortDirection } from '../common/sort-direction';

export interface GetInvoicesRequestV1 extends PagedRequestV1 {
  search?: string | null;
  id?: string;
  clientId?: string;
  sortBy: SortColumn;
  sortDirection: SortDirection;
  period?: Period | null;
  startDate?: Date | null;
  endDate?: Date | null;
}

export enum SortColumn {
  ClientName = 1,
  InvoiceNumber = 2,
  Total = 3,
  TotalApprovedHours = 4,
  Date = 5,
}

export interface GetInvoicesRecordV1 {
  id: string;
  clientId: string;
  clientName: string;
  date: Date;
  invoiceNumber: string;
  total: number;
  totalApprovedHours: number;
}

export interface GetInvoicesRecordsV1 {
  records: [GetInvoicesRecordV1];
  total: number | null;
}

export interface GetInvoicesResponseV1
  extends PagedResponseV1<GetInvoicesRecordV1> {}
