export interface AddTimeToInvoiceRequestV1 {
  id: string;
  //invoicedId: string;
  hoursInvoiced?: number;
}

export interface AddTimeToInvoiceResponseV1 {
  id: string;
}

export interface AddTimesToInvoiceRequestV1 {
  invoiceId: string;
  timeEntries: Array<AddTimeToInvoiceRequestV1>;
}

export interface RemoveTimeFromInvoiceRequestV1 {
  id: string;
}
