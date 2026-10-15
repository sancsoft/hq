import { ProjectColorStatus } from '../../enums/project-color-status';

export interface updatePSRColorStatusRequestV1 {
  projectStatusReportId: string;
  projectStatusColor: ProjectColorStatus | null;
}

export interface UpdatePSRColorStatusResponseV1 {
  projectStatusReportId: string;
}
