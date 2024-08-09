export interface AddProjectMemberRequestV1 {
  projectId: string;
  staffId: string | null;
}

export interface AddProjectMemberResponseV1 {
  id: string;
}
