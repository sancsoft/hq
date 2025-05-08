export interface UpsertInvoiceRequestV1 {
  id?: string;
  date: Date | null;
  invoiceNumber: string | null;
  total: number | null;
  totalApprovedHours: number | null;
}

export interface UpsertInvoiceResponseV1 {
  id: string;
}
