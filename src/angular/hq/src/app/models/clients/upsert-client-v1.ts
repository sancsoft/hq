export interface UpsertClientRequestV1 {
    id?: string;
    name: string;
    officialName?: string | null;
    billingEmail?: string | null;
    hourlyRate?: number | null;
}

export interface UpsertClientResponseV1 {
    id: string;
}
