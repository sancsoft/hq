export interface updateTimeRequestV1 {
  id?: string | null;
  date: string;
  staffId: string;
  activityId?: string | null;
  task?: string | null;
  notes?: string | null;
  chargeCodeId?: string | null;
  hours?: number | null;
  chargeCode: string;
}

export interface UpdateTimeResponseV1 {
  id: string;
}

export interface UpdateTimeHoursInvoicedRequestV1 {
  id: string;
  hoursInvoiced: number;
}

export interface UpdateTimeHoursInvoicedResponseV1 {
  id: string;
  hoursInvoiced: number;
}
