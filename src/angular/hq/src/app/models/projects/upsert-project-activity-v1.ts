export interface UpsertProjectActivityRequestV1 {
  id?: string;
  projectId: string;
  name: string | null;
}

export interface UpsertProjectActivityResponseV1 {
  id: string;
}
