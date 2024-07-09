import { PagedResponseV1 } from '../common/paged-response-v1';
import { SortDirection } from '../common/sort-direction';
import { TimeStatus } from '../common/time-status';

export interface GetTimeRequestV1 {
  Id?: string | null;
  search?: string | null;
  sortBy: SortColumn;
  sortDirection: SortDirection;
  period?: Period | null;
  startDate?: Date | null;
  endDate?: Date | null;
  date?: Date | null;
  staffId?: string | null;
  projectId?: string | null;
  clientId?: string | null;
  invoiced?: boolean | null;
  TimeAccepted?: boolean | null;
  activityId: string | null;
}

export enum SortColumn {
  Hours = 1,
  Date = 2,
  ChargeCode = 3,
  StaffName = 4,
  ClientName = 5,
  ProjectName = 6,
  Billable = 7,
}

export interface GetTimeRecordV1 {
  id: string;
  status: TimeStatus;
  billableHours: number;
  hours: number;
  date: Date;
  chargeCode: string;
  staffName: string | null;
  billable: boolean;
  clientName: string | null;
  projectName: string | null;
  rejectionNotes: string | null;
  task: string | null;
  projectId: string;
  clientId: string;
  activityName?: string | null;
  activityId: string | null;
  description?: string | undefined;
  invoiceId?: string | null;
  invoiceNumber?: string | null;
  hoursApproved?: number | null;
  hoursApprovedBy?: string | null;
}
export interface GetTimeRecordStaffV1 extends BaseRecordV1 {}

export interface GetTimeRecordClientsV1 extends BaseRecordV1 {}

export interface GetTimeRecordProjectsV1 extends BaseRecordV1 {
  chargeCode: string | null;
}

export interface BaseRecordV1 {
  id: string;
  name: string;
}

export interface GetTimeRecordsV1 {
  records: [GetTimeRecordV1];
  staff: [GetTimeRecordStaffV1];
  total: number | null;
  totalHours: number;
  billableHours: number;
  acceptedHours: number;
  acceptedBillableHours: number;
}

export enum Period {
  Week = 1,
  Month = 2,
  Quarter = 3,
  Year = 4,
  Today = 5,
  LastWeek = 6,
  LastMonth = 7,
  Custom = 8,
}

export interface GetTimeV1 extends PagedResponseV1<GetTimeRecordV1> {}
