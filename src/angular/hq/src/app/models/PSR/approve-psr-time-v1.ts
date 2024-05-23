export interface ApprovePSRTimeRequestV1 {
    projectStatusReportId: string;
    timeIds: string[];
}

export interface ApprovePSRTimeResponseV1 {
    approved: number;
}
