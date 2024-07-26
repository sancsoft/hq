export interface GetStatusRequestV1 {
  id?: string;
  staffId: string;
}

export interface GetStatusResponseV1 {
  id?: string;
  staffId: string;
  status: string;
}
