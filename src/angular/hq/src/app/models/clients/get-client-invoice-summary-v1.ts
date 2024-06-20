export interface GetClientInvoiceSummaryV1Request {
    id: string;
}

export interface GetClientInvoiceSummaryV1Response {
    monthToDate: number|null;
    lastMonthToDate: number|null;
    yearToDate: number|null;
    allTimeToDate: number|null;
}
