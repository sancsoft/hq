import { ProjectStatus } from '../../enums/project-status';
import { PagedRequestV1 } from '../common/paged-request-v1';
import { PagedResponseV1 } from '../common/paged-response-v1';
import { SortDirection } from '../common/sort-direction';

export interface GetServicesRequestV1 extends PagedRequestV1 {
  search?: string | null;
  id?: string;
  clientId?: string;
  sortBy: SortColumn;
  sortDirection: SortDirection;
}

export enum SortColumn {
  chargeCode = 1,
  Price = 2,
  Cost = 3,
  StartDate = 4,
  EndDate = 5,
  Status = 6,
}

export interface GetServicesRecordV1 {
  id: string;
  clientId: string;
  name: string;
  serviceNumber: number;
  description?: string;
  quoteId?: string;
  costValue: number;
  costPeriod: number;
  priceValue: number;
  pricePeriod: number;
  startDate?: Date;
  endDate?: Date;
  chargeCode?: string;
  chargeCodeDescription?: string;
  quoteStatus: ProjectStatus;
}

export interface GetServicesRecordsV1 {
  records: [GetServicesRecordV1];
  total: number | null;
}

export interface GetProjectResponseV1
  extends PagedResponseV1<GetServicesRecordsV1> {}
