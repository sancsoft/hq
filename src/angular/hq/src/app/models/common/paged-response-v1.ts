export interface PagedResponseV1<T> {
    records: T[];
    total?: number;
}
