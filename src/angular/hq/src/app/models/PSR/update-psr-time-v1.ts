export interface updatePSRTimeRequestV1 {
  projectStatusReportId: string;
  timeId: string;
  billableHours: number;
  activityId?: string | null;
  task?: string | null;
  notes: string;
  chargeCodeId: string;
}

export interface UpdatePSRTimeResponseV1 {
  message: string;
}
