export interface updateTimeRequestV1 {
  projectStatusReportId: string;
  timeId: string;
  billableHours: number;
  activityId?: string|null;
  task?: string|null;
  notes: string;
  chargeCodeId: string;
}

export interface UpdateTimeResponseV1 {
    message: string;
}
