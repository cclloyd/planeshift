export const sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export const parseCookies = (cookieHeader: string | undefined): Record<string, string> => {
    if (!cookieHeader) return {};
    return cookieHeader.split(';').reduce(
        (cookies, cookieStr) => {
            const [key, ...val] = cookieStr.trim().split('=');
            cookies[key] = decodeURIComponent(val.join('='));
            return cookies;
        },
        {} as Record<string, string>,
    );
};
