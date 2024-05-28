

export interface UpsertUserRequestV1 {
  firstName?: string | null;
  lastName?: string | null;
  email: string | null;
  staffId?: string | null;
  enabled: boolean;
  isStaff: boolean;
  isManager: boolean;
  isPartner: boolean;
  isExecutive: boolean;
  isAdministrator: boolean;
}

export interface UpsertUserResponseV1 {
  id:string;
}
