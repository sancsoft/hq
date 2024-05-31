export interface UpsertStaffMemberRequestV1 {
  name?: string | null;
  workingHours?: number | null;
  vacationHours?: number | null;
  startDate?: Date | null;
  jurisdiciton?: number | undefined
}

export interface UpsertStaffMemberResponseV1 {
  id:string;
}
