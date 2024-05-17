import { PagedRequestV1 } from "../common/paged-request-v1";
import { PagedResponseV1 } from "../common/paged-response-v1";
import { SortDirection } from "../common/sort-direction";

export interface GetProjectRequestV1 extends PagedRequestV1 {
    search?: string | null;
    id?: string;
    clientId?: string;
    sortBy: SortColumn;
    sortDirection: SortDirection;
}

export enum SortColumn
{
    CreatedAt = 1,
    Name = 2,
    HourlyRate = 3
}

export interface GetProjectRecordV1 {
  id: string;
  projectNumber: number;
  clientId: string;
  clientName: string;
  projectManagerId: string | null;
  projectManagerName: string | null;
  name: string;
  quoteId: string | null;
  quoteNumber: string | null;
  chargeCode: string;
  hourlyRate: number;
  bookingHours: number;
  bookingPeriod: number;
  startDate: Date | null;
  endDate: Date | null;
}

export interface GetProjectRecordsV1 {
  records : [GetProjectRecordV1];
  total: number | null;
}

export interface GetProjectResponseV1 extends PagedResponseV1<GetProjectRecordV1> {
}
