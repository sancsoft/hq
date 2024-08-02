import { PlanningPoint } from './get-points-v1';

export interface upsertPointsRequestV1 {
  id?: string | null;
  date: string;
  staffId: string;
  points: PlanningPoint[];
}

export interface upsertPointsResponseV1 {
  pointIds: string[];
}
