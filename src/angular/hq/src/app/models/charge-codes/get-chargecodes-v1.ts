import { PagedRequestV1 } from "../common/paged-request-v1";
import { PagedResponseV1 } from "../common/paged-response-v1";
import { SortDirection } from "../common/sort-direction";

// Interface for the paged request with sorting and optional filters specific to charge codes
export interface GetChargeCodesRequestV1 extends PagedRequestV1 {
  search?: string;
  id?: string;
  sortBy: SortColumn;
  sortDirection: SortDirection;
  projectId?: string | null,
  clientId?: string | null,
  billable?: boolean;
  active?: boolean;
}

// Enum for specifying the sortable columns in charge code requests
export enum SortColumn {
  Code = 1,
  Billable = 2,
  Active = 3,
  ProjectName = 4,
  QuoteName = 5,
  ServiceAgreementName = 6
}

// Interface representing a single charge code record
export interface GetChargeCodeRecordV1 {
  id: string;
  code: string;
  billable: boolean;
  active: boolean;
  projectName?: string;
  quoteName?: string;
  serviceAgreementName?: string;
  description?: string;
}

// Interface for the response containing a list of charge code records
export interface GetChargeCodesResponseV1 extends PagedResponseV1<GetChargeCodeRecordV1> {
}
