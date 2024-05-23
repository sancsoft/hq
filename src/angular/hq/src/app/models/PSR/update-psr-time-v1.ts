export interface updatePSRTimeRequestV1 {
  projectStatusReportId: string;
  timeId: string;
  billableHours: number;
  activity: string;
  notes: string;
  chargeCodeId: string;
}

export interface UpdatePSRTimeResponseV1 {
    message: string;
}
