

export interface UpsertUserRequestV1 {
  firstName?: string | null;
  lastName?: string | null;
  email: string | null;
  staffId?: string | null;
  enabled: boolean | null;
  isStaff: boolean | null;
  isManager: boolean | null;
  isPartner: boolean | null;
  isExecutive: boolean | null;
  isAdministrator: boolean | null;
}

export interface UpsertUserResponseV1 {
  id:string;
}
