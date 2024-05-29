import { PagedResponseV1 } from "../common/paged-response-v1";
import { SortDirection } from "../common/sort-direction";
import { TimeStatus } from "../common/time-status";

export interface GetPSRTimeRequestV1 {
    ProjectStatusReportId: string;
    search?: string | null;
    sortBy: SortColumn;
    sortDirection: SortDirection;
}

export enum SortColumn {
    BillableHours = 1,
    Hours = 2,
    Date = 3,
    ChargeCode = 4,
    StaffName = 5,
    Activity = 6
}

export interface GetPSRTimeRecordV1 {
    id: string;
    status: TimeStatus;
    billableHours: number;
    hours: number;
    date: string;
    chargeCode: string;
    staffName: string;
    task?: string|null;
    activityName?: string|null;
    activityId?: string|null;
    description?: string | undefined;
}

export interface GetPSRTimeV1 extends PagedResponseV1<GetPSRTimeRecordV1> {}