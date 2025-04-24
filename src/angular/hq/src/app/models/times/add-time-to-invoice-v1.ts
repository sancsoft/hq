export interface AddTimeToInvoiceRequestV1 {
  id: string;
  invoiceId: string;
  hoursInvoiced?: number;
}

export interface AddTimeToInvoiceResponseV1 {
  id: string;
}

export interface AddTimesToInvoiceRequestV1 {
  invoiceId: string;
  timeEntries: Array<Partial<AddTimeToInvoiceRequestV1>>;
}

export interface RemoveTimeFromInvoiceRequestV1 {
  id: string;
}
