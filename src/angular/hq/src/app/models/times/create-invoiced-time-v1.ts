export interface CreateInvoicedTimeRequestV1 {
  id?: string | null;
  date: string;
  staffId: string;
  activityId?: string | null;
  task?: string | null;
  notes?: string | null;
  chargeCodeId?: string | null;
  invoiceId?: string | null;
  hoursInvoiced?: number | null;
  hours?: number | null;
  chargeCode: string;
}

export interface CreateInvoicedTimeResponseV1 {
  id: string;
}