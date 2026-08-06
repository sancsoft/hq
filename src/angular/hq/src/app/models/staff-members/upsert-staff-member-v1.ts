export interface UpsertStaffMemberRequestV1 {
  firstName?: string | null;
  email: string | null;
  lastName?: string | null;
  name?: string | null;
  workHours?: number | null;
  vacationHours?: number | null;
  startDate?: Date | null;
  endDate?: Date | null;
  jurisdiciton?: number | null;
  createUser?: boolean | null;
}

export interface UpsertStaffMemberResponseV1 {
  id: string;
}

export interface UpsertStaffTimeEntryCutOffDateRequestV1 {
  id: string;
  timeEntryCutOffDate: string;
}

export interface UpsertStaffTimeEntryCutOffDateResponseV1 {
  id: string;
}
