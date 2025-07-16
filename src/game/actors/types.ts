export interface PaginatedActors {
    data: Actor<any>[] | Actor[];
    length: number;
    total: number;
    page: number;
    totalPages: number;
    limit: number;
}
