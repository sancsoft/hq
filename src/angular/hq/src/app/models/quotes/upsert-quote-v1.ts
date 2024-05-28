export interface UpsertQuoteRequestV1 {
  id?: string;
  clientId: string | null;
  name: string | null;
  quoteId: string | null;
  status: number | null;
  date: Date | null;
  value: number | null;
}

export interface UpsertQuoteResponsetV1 {
  id: string;
}
