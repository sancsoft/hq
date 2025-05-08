export interface GetInvoiceDetailsRequestV1 {
  id: string;
}

export interface GetInvoiceDetailsRecordV1 {
  id: string;
  clientId: string;
  clientName: string;
  date: Date;
  invoiceNumber: string;
  total: number;
  totalApprovedHours: number;
  totalHours: number;
  billableHours: number;
  acceptedHours: number;
  invoicedHours: number;
  acceptedBillableHours: number;
  chargeCodes: Array<InvoiceChargeCode>;
}

export interface InvoiceChargeCode {
  id: string;
  code: string;
  billable: boolean;
  active: boolean;
  projectName?: string;
  quoteName?: string;
  projectId?: string;
  quoteId?: string;
}
