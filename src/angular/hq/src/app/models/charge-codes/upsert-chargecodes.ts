
export interface UpsertChargeCodesRequestV1 {
    id?: string | null;
    activity: number | null;
    projectId?: string | null;
    QuoteId?: string | null;
    serviceAgreementId?: string | null;
    billable: boolean | null;
    active: boolean | null;
    description?: string | null;

}

export interface UpsertChargeCodesResponseV1 {
  id: string;
  chargeCode: string;
}