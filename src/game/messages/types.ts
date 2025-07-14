export interface MessageLinks {
    // scenes?: Scene[];
    // actors?: Actor[];
    // tokens?: Token[];
    scenes?: Record<string, Scene>;
    actors?: Record<string, Actor>;
    tokens?: Record<string, Token>;
}

export interface PaginatedMessages {
    data: ChatMessage<any>[] | ChatMessage[];
    total: number;
    page: number;
    limit: number;
    links?: MessageLinks;
}
