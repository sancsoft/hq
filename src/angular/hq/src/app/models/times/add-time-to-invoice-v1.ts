export interface AddTimeToInvoiceRequestV1 {
  id: string;
  invoiceId: string;
  hoursInvoiced?: number | null;
}

export interface AddTimeToInvoiceResponseV1 {
  id: string;
}
