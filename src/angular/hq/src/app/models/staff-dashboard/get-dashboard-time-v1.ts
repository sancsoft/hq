import { TimeStatus } from '../../enums/time-status';
import { Period } from '../../projects/project-create/project-create.component';

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
  staffName: string;
  vacation: number;
  startDate: string;
  endDate: string;
  previousDate: string;
  nextDate: string;
  dates: GetDashboardTimeV1TimeForDate[];
  chargeCodes: GetDashboardTimeV1ChargeCode[];
  clients: GetDashboardTimeV1Client[];
  rejectedCount: number;
  canSubmit: boolean;
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

export interface GetDashboardTimeV1ChargeCode {
  id: string;
  clientId: string;
  projectId: string;
  code: string;
}

export interface GetDashboardTimeV1Client {
  id: string;
  name: string;
  projects: GetDashboardTimeV1Project[];
}

export interface GetDashboardTimeV1Project {
  id: string;
  chargeCodeId: string | null;
  chargeCode: string | null;
  name: string;
  activities: GetDashboardTimeV1ProjectActivity[];
}

export interface GetDashboardTimeV1ProjectActivity {
  id: string;
  name: string;
}
