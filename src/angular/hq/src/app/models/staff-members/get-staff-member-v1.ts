import { Jurisdiciton } from '../../enums/jurisdiciton';
import { PagedRequestV1 } from '../common/paged-request-v1';
import { PagedResponseV1 } from '../common/paged-response-v1';
import { SortDirection } from '../common/sort-direction';

export enum SortColumn {
  Name = 1,
  FirstName = 2,
  LastName = 3,
  StartDate = 4,
  EndDate = 5,
  WorkHours = 6,
  VacationHours = 7,
  Hrs = 8,
  BillableHrs = 9,
  Status = 10,
  Jurisdiction = 11,
}

export interface GetStaffV1Request extends PagedRequestV1 {
  search?: string | null;
  id?: string;
  isAssignedProjectManager?: boolean;
  jurisdiciton?: Jurisdiciton;
  sortBy?: SortColumn;
  sortDirection?: SortDirection;
  currentOnly: boolean | null;
  status?: string | null;
}

export interface GetStaffV1Record {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  workHours: number;
  vacationHours: number;
  jurisdiciton: Jurisdiciton;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  hrs?: number;
  billableHrs?: number;
}

export interface GetStaffV1Response extends PagedResponseV1<GetStaffV1Record> {}
