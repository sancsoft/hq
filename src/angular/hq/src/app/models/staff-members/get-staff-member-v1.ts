import { PagedRequestV1 } from "../common/paged-request-v1";
import { PagedResponseV1 } from "../common/paged-response-v1";

export enum SortDirection {
  Asc = "ASC",
  Desc = "DESC",
}


export enum Jurisdiciton {
  Federal = "FEDERAL",
  State = "STATE",
  Local = "LOCAL",
}



export enum StaffSortColumn {
  CreatedAt = "CreatedAt",
  Name = "Name",
  WorkHours = "WorkHours",
}

export interface GetStaffV1Request extends PagedRequestV1 {
  search?: string;
  id?: string; 
  jurisdiciton?: Jurisdiciton;
  sortBy?: StaffSortColumn;
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
