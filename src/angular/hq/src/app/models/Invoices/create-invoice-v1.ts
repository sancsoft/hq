export interface CreateInvoiceRequestV1 {
  clientId: string | null;
  date: string | null;
  invoiceNumber: string | null;
  total: number | null;
  totalApprovedHours: number | null;
}

export interface CreateInvoiceResponseV1 {
  id: string;
}
