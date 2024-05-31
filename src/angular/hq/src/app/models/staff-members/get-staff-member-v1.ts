import { PagedRequestV1 } from '../common/paged-request-v1';
import { PagedResponseV1 } from '../common/paged-response-v1';
import { SortDirection } from '../common/sort-direction';

export enum Jurisdiciton {
  USA = 1,
  Colombia = 2,
}

export enum SortColumn {
  StartDate = 1,
  Name = 2,
  WorkHours = 3,
  VacationHours = 4
}

export interface GetStaffV1Request extends PagedRequestV1 {
  search?: string | null;
  id?: string;
  isAssignedProjectManager?: boolean;
  jurisdiciton?: Jurisdiciton;
  sortBy?: SortColumn;
  sortDirection?: SortDirection;
}

export interface GetStaffV1Record {
  id: string;
  name: string;
  workHours: number;
  vacationHours: number;
  jurisdiciton: Jurisdiciton;
  startDate?: Date;
  endDate?: Date;
}

export interface GetStaffV1Response extends PagedResponseV1<GetStaffV1Record> {}
