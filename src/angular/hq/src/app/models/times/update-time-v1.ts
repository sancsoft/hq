export interface updateTimeRequestV1 {
  id: string;
  activityId?: string | null;
  task?: string | null;
  notes: string;
  hours: number;
  chargeCode: string;
}

export interface UpdateTimeResponseV1 {
  message: string;
}
