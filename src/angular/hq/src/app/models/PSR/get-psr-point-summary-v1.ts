export interface GetPSRPointSummaryRequestV1 {
  projectStatusReportId: string;
}

export interface GetPSRPointSummaryRecordV1 {
  staffId: string;
  staffName: string;
  allocatedPoints: number;
  utilizedPoints: number;
}

export interface GetPSRPointSummaryV1 {
  staff: GetPSRPointSummaryRecordV1[];
}