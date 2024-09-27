import { PagedRequestV1 } from '../common/paged-request-v1';
import { PagedResponseV1 } from '../common/paged-response-v1';

export interface GetUsersRequestV1 extends PagedRequestV1 {
  search?: string | null;
  id?: string | null;
}

export interface GetUsersRecordV1 {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string | null;
  staffId?: string | null;
  enabled: boolean;
  isStaff: boolean;
  isManager: boolean;
  isPartner: boolean;
  isExecutive: boolean;
  isAdministrator: boolean;
}

export interface GetUsersRecordsV1 {
  records: [GetUsersRecordV1];
  total: number;
}

export interface GetUsersResponseV1 extends PagedResponseV1<GetUsersRecordV1> {}
