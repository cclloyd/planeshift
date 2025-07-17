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

export class LooseBoolean extends Boolean {
    private value: boolean;

    constructor(input: unknown) {
        super();
        this.value = this.interpret(input);
    }

    private interpret(input: unknown): boolean {
        if (typeof input === 'boolean') return input;

        const falsyStrings = ['false', 'f', 'no', 'n', '0', 'off'];
        const truthyStrings = ['true', 't', 'yes', 'y', '1', 'on'];

        if (input == null) return false;

        if (typeof input === 'string') {
            const normalized = input.trim().toLowerCase();
            if (falsyStrings.includes(normalized)) return false;
            if (truthyStrings.includes(normalized)) return true;

            const num = Number(input);
            if (!isNaN(num)) return num !== 0;
        }

        if (typeof input === 'number') {
            return input !== 0;
        }

        return Boolean(input);
    }

    valueOf(): boolean {
        return this.value;
    }

    toString(): string {
        return String(this.value);
    }

}
