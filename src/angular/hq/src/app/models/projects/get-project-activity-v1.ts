import { PagedResponseV1 } from '../common/paged-response-v1';

export interface GetProjectActivityRequestV1 {
  projectId?: string | null;
}
export interface GetProjectActivityRecordV1 {
  id: string;
  name: string;
  sequence: number;
  projectId: string;
}

export interface GetProjectActivityRecordsV1 {
  records: [GetProjectActivityRecordV1];
  total: number | null;
}

export interface GetProjectActivitiesResponseV1
  extends PagedResponseV1<GetProjectActivityRecordV1> {}
