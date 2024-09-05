import { Period } from '../../enums/period';
import { TimeStatus } from '../../enums/time-status';

export interface GetDashboardTimeV1Request {
  staffId: string;
  period: Period;
  date?: string;
  search?: string | null;
  status?: TimeStatus | null;
}

export interface GetDashboardTimeV1Response {
  totalHours: number;
  billableHours: number;
  hoursThisWeek: number;
  hoursThisMonth: number;
  hoursLastWeek: number;
  maximumTimeEntryHours: number;
  staffName: string;
  vacation: number;
  startDate: string;
  endDate: string;
  previousDate: string;
  nextDate: string;
  dates: GetDashboardTimeV1TimeForDate[];
  rejectedCount: number;
  canSubmit: boolean;
  timeEntryCutoffDate: string;
}

export interface GetDashboardTimeV1TimeForDate {
  date: string;
  times: GetDashboardTimeV1TimeForDateTimes[];
  totalHours: number;
  canCreateTime: boolean;
}

export interface GetDashboardTimeV1TimeForDateTimes {
  id: string;
  date: string;
  hours: number;
  notes: string | null;
  task: string | null;
  chargeCodeId: string | null;
  maximumTimeEntryHours: number;
  chargeCode: string;
  clientId: string | null;
  projectId: string | null;
  activityName: string | null;
  clientName: string | null;
  projectName: string | null;
  activityId: string | null;
  timeStatus: TimeStatus | null;
  rejectionNotes: string | null;
}
