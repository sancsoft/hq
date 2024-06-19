import { PagedResponseV1 } from '../common/paged-response-v1';
import { SortDirection } from '../common/sort-direction';
import { TimeStatus } from '../common/time-status';

export interface GetTimeRequestV1 {
  search?: string | null;
  sortBy: SortColumn;
  sortDirection: SortDirection;
  // period?: Period | null;
  startDate?: Date | null;
  endDate?: Date | null;
  date?: Date | null;
  staffId?: string | null;
  projectId?: string | null;
  clientId?: string | null;
  activityId: string | null;
}

export enum SortColumn {
  Hours = 1,
  Date = 2,
  ChargeCode = 3,
  Activity = 4
}

export interface GetTimeRecordV1 {
  id: string;
  status: TimeStatus;
  billableHours: number;
  hours: number;
  date: string;
  chargeCode: string;
  staffName: string | null;
  clientName: string | null
  projectName: string | null;
  rejectionNotes: string | null;
  task?: string | null;
  projectId: string;
  activityName?: string | null;
  activityId?: string | null;
  description?: string | undefined;
  invoiceId?: string | null;
  invoiceNumber?: string | null;
  hoursApproved?: number | null;
  hoursApprovedBy?: string | null;

}
export interface GetTimeRecordStaffV1 {
  id: string;
  name: string;
  totalHours: number;
}

export interface GetTimeRecordsV1 {
  records: [GetTimeRecordV1];
  staff: [GetTimeRecordStaffV1];
  total: number | null;
}

export interface GetTimeV1 extends PagedResponseV1<GetTimeRecordV1> {}
