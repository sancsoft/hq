export interface getPointsRequestV1 {
  id?: string | null;
  date: string;
  staffId: string;
}

export interface PlanningPoint {
  id: string | null;
  chargeCodeId: string | null;
  chargeCode: string | null;
  projectName: string | null;
  projectId: string | null;
  sequence: number;
}

export interface getPointsResponseV1 {
  date: string;
  staffId: string;
  points: PlanningPoint[];
  displayDate: string;
  previousDate: string;
  nextDate: string;
}
