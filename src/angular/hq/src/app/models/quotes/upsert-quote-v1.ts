export interface UpsertQuoteRequestV1 {
  id?: string;
  clientId: string | null;
  name: string | null;
  quoteId: string | null;
  status: number | null;
  date: string | null;
  value: number | null;
  quoteNumber: number | null;
}

export interface UpsertQuoteResponsetV1 {
  id: string;
}
