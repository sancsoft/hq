import { TimeStatus } from '../../enums/time-status';
import { PagedResponseV1 } from '../common/paged-response-v1';
import { SortDirection } from '../common/sort-direction';

export interface GetPSRTimeRequestV1 {
  ProjectStatusReportId: string;
  search?: string | null;
  sortBy: SortColumn;
  sortDirection: SortDirection;
  activityId: string | null;
}

export enum SortColumn {
  BillableHours = 1,
  Hours = 2,
  Date = 3,
  ChargeCode = 4,
  StaffName = 5,
}

export interface GetPSRTimeRecordV1 {
  id: string;
  status: TimeStatus;
  billableHours: number;
  hours: number;
  date: string;
  chargeCode: string;
  staffName: string;
  rejectionNotes: string | null;
  task?: string | null;
  projectId: string;
  activityName?: string | null;
  activityId?: string | null;
  description?: string | undefined;
}
export interface GetPSRTimeRecordStaffV1 {
  id: string;
  name: string;
  totalHours: number;
}

export interface GetPSRTimeRecordsV1 {
  records: [GetPSRTimeRecordV1];
  staff: [GetPSRTimeRecordStaffV1];
  projectId: string;
  total: number | null;
}

export interface GetPSRTimeV1 extends PagedResponseV1<GetPSRTimeRecordV1> {}
