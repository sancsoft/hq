export interface UpsertStaffMemberRequestV1 {
  firstName?: string | null;
  email?: string | null;
  lastName?: string | null;
  name?: string | null;
  workHours?: number | null;
  vacationHours?: number | null;
  startDate?: Date | null;
  endDate?: Date | null;
  jurisdiciton?: number | null;
}

export interface UpsertStaffMemberResponseV1 {
  id: string;
}
