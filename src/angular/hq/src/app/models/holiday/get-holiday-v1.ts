import { PagedRequestV1 } from '../common/paged-request-v1';
import { PagedResponseV1 } from '../common/paged-response-v1';
import { SortDirection } from '../common/sort-direction';

export enum Jurisdiciton {
  USA = 1,
  Colombia = 2,
}

export enum SortColumn {
  Name = 1,
  Date = 2,
  Jurisdiciton = 3,
}

export interface GetHolidayV1Request extends PagedRequestV1 {
  search?: string | null;
  id?: string;
  jurisdiciton?: Jurisdiciton;
  sortBy?: SortColumn;
  sortDirection?: SortDirection;
}

export interface GetHolidayV1Record {
  id: string;
  name: string;
  jurisdiciton: Jurisdiciton;
  date?: Date;
}

export interface GetHolidayV1Response
  extends PagedResponseV1<GetHolidayV1Record> {}
