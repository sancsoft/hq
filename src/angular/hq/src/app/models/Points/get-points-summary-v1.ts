export interface GetPointsSummaryRequestV1 {
  date: string;
  search?: string | null;
}

export interface GetPointsSummaryPlanningPoint {
  sequence: number;
  chargeCodeId: string | null;
  chargeCode: string | null;
  projectName: string | null;
  projectId: string | null;
  clientName: string | null;
  clientId: string | null;
  completed: boolean;
}

export interface GetPointSummaryV1StaffSummary {
  staffId: string;
  staffName: string;
  points: GetPointsSummaryPlanningPoint[];
  completed: boolean;
}

export interface GetPointsSummaryResponseV1 {
  totalPoints: number;
  emptyPoints: number;
  date: string;
  staff: GetPointSummaryV1StaffSummary[];
  displayDate: string;
  previousDate: string;
  nextDate: string;
}
