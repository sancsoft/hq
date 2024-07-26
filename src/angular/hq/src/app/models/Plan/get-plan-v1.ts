export interface GetPlanRequestV1 {
  id?: string;
  staffId: string;
  date: string;
}

export interface GetPlanResponseV1 {
  id: string;
  date: string;
  staffId: string;
  body: string;
}
