export interface UpsertStaffMemberRequestV1 {
  name?: string | null;
  workHours?: number | null;
  vacationHours?: number | null;
  startDate?: Date | null;
  jurisdiciton?: number | null;
}

export interface UpsertStaffMemberResponseV1 {
  id:string;
}
