export interface UpdateInvoiceRequestV1 {
  id?: string;
  date: string | null;
  invoiceNumber: string | null;
  total: number | null;
  totalApprovedHours: number | null;
}

export interface UpdateInvoiceResponseV1 {
  id: string;
}
