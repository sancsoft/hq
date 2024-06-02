export interface UnapprovePSRTimeRequestV1 {
    projectStatusReportId: string;
    timeId: string;
}

export interface UnapprovePSRTimeResponseV1 {
    unapproved: boolean;
}
