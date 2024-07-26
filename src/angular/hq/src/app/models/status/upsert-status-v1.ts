export interface UpsertStatusRequestV1 {
  id?: string;
  staffId: string;
  status: string | null;
}

export interface UpsertStatusResponseV1 {
  id: string;
}
