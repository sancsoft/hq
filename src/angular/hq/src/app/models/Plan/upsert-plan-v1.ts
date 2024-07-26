export interface UpsertPlanRequestV1 {
  id?: string;
  staffId: string;
  date: string;
  body: string | null;
}

export interface UpsertPlanResponseV1 {
  id: string;
}
