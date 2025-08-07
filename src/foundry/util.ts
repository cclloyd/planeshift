export function paginateRaw<T>(
    input: T[],
    page = 1,
    limit = 100,
    order: 'asc' | 'desc' = 'desc',
    typeFilter?: (item: T) => boolean
): {
    data: T[];
    length: number;
    total: number;
    totalPages: number;
    page: number;
    limit: number;
} {
    if (order === 'asc') input = [...input].reverse();
    const filtered = typeFilter ? input.filter(typeFilter) : input;
    const total = filtered.length;
    const start = (page - 1) * limit;
    const slice = filtered.slice(start, start + limit);
    return {
        data: order === 'asc' ? slice.reverse() : slice,
        length: slice.length,
        total,
        totalPages: Math.ceil(total / limit),
        page,
        limit,
    };
}
