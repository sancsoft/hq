export interface UpsertHolidayRequestV1 {
  id?: string;
  name: string | null;
  date: Date | null;
  jurisdiciton?: number | null;
}

export interface UpsertHolidayResponseV1 {
  id: string;
}
