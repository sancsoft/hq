import { ChargeCodeActivity } from '../../enums/charge-code-activity';
import { PagedRequestV1 } from '../common/paged-request-v1';
import { PagedResponseV1 } from '../common/paged-response-v1';
import { SortDirection } from '../common/sort-direction';

// Interface for the paged request with sorting and optional filters specific to charge codes
export interface GetChargeCodesRequestV1 extends PagedRequestV1 {
  search?: string | null;
  id?: string;
  sortBy: SortColumn;
  sortDirection: SortDirection;
  projectId?: string | null;
  clientId?: string | null;
  billable?: boolean;
  active?: boolean;
  staffId?: string | null;
}

// Enum for specifying the sortable columns in charge code requests
export enum SortColumn {
  Code = 1,
  Billable = 2,
  Active = 3,
  ProjectName = 4,
  QuoteName = 5,
  ServiceAgreementName = 6,
  IsProjectMember = 7,
}

// Interface representing a single charge code record
export interface GetChargeCodeRecordV1 {
  activity: ChargeCodeActivity;
  activities: Activity[];
  id: string;
  code: string;
  billable: boolean;
  active: boolean;
  projectName?: string;
  quoteName?: string;
  serviceAgreementName?: string;
  description?: string;
  quoteId?: string;
  projectId?: string;
  clientId?: string;
  clientName?: string;
  maximumTimeEntryHours: number;
  serviceAgreementId?: string;
  isProjectMember: boolean | null;
  requireTask: boolean;
}
export interface Activity {
  id: string;
  name: string;
}

// Interface for the response containing a list of charge code records
export interface GetChargeCodesResponseV1
  extends PagedResponseV1<GetChargeCodeRecordV1> {}
