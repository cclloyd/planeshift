export interface PaginatedScenes {
    data: Scene[];
    length: number;
    total: number;
    page: number;
    totalPages: number;
    limit: number;
}
