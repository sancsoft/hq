
export interface UpsertProjectRequestV1 {
  id?: string;
  clientId: string | null;
  projectManagerId: string | null;
  name: string | null;
  quoteId: string | null;
  hourlyRate: number | null;
  bookingHours: number | null;
  bookingPeriod: number | null;  // Period as number
  startDate: Date | null;
  endDate: Date | null;
}

export interface UpsertProjectResponsetV1 {
  id: string;
}
