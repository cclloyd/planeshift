export interface FoundryEnv {
    FOUNDRY_HOST: string;
    FOUNDRY_USER: string;
    FOUNDRY_PASS: string;
    FOUNDRY_ADMIN_PASS?: string;
    FOUNDRY_LOG_ENABLED: boolean;
    OIDC_ISSUER?: string;
    OIDC_CLIENT_ID?: string;
    OIDC_CLIENT_SECRET?: string;
    OIDC_CALLBACK_URL?: string;
    OIDC_EXTRA_SCOPES?: string | string[];
    OIDC_USERNAME_ATTRIBUTE?: string;
    SECRET_KEY: string;
    AUTH_METHOD: string;
    MONGO_HOST: string;
    MONGO_PORT: number;
    MONGO_DB: string;
    MONGO_USER: string;
    MONGO_PASS: string;
    DISCORD_GUILD_ID?: string;
    DISCORD_ROLE_ID?: string;
    DISCORD_API: string;
}

export const dotEnv: FoundryEnv = {
    FOUNDRY_HOST: process.env.FOUNDRY_HOST!,
    FOUNDRY_USER: process.env.FOUNDRY_USER!,
    FOUNDRY_PASS: process.env.FOUNDRY_PASS!,
    FOUNDRY_ADMIN_PASS: process.env.FOUNDRY_ADMIN_PASS,
    FOUNDRY_LOG_ENABLED: Boolean(process.env.FOUNDRY_LOG_ENABLED).valueOf(),
    OIDC_ISSUER: process.env.OIDC_ISSUER,
    AUTH_METHOD: process.env.AUTH_METHOD ?? 'discord',
    OIDC_CLIENT_ID: process.env.OIDC_CLIENT_ID,
    OIDC_CLIENT_SECRET: process.env.OIDC_CLIENT_SECRET,
    OIDC_CALLBACK_URL: process.env.OIDC_CALLBACK_URL,
    OIDC_EXTRA_SCOPES: process.env.OIDC_EXTRA_SCOPES ?? [],
    OIDC_USERNAME_ATTRIBUTE: process.env.OIDC_USERNAME_ATTRIBUTE,
    SECRET_KEY: process.env.SECRET_KEY!,
    MONGO_HOST: process.env.MONGO_HOST ?? 'localhost',
    MONGO_PORT: process.env.MONGO_PORT ? parseInt(process.env.MONGO_PORT) : 27017,
    MONGO_DB: process.env.MONGO_DB ?? 'foundryvttapi',
    MONGO_USER: process.env.MONGO_USER ?? 'foundryvttapi',
    MONGO_PASS: process.env.MONGO_PASS ?? 'foundryvttapi',
    DISCORD_GUILD_ID: process.env.DISCORD_GUILD_ID,
    DISCORD_ROLE_ID: process.env.DISCORD_ROLE_ID,
    DISCORD_API: process.env.DISCORD_API ?? 'https://discord.com/api/v10',
};

export const requireEnv = () => {
    if (!process.env.FOUNDRY_HOST) throw new Error('Environment variable `FOUNDRY_HOST` not set.');
    if (!process.env.FOUNDRY_USER) throw new Error('Environment variable `FOUNDRY_USER` not set.');
    if (!process.env.FOUNDRY_PASS) throw new Error('Environment variable `FOUNDRY_PASS` not set.');
    if (process.env.AUTH_METHOD) {
        if (!['oidc', 'local', 'discord'].includes(process.env.AUTH_METHOD)) {
            throw new Error('Environment variable `AUTH_METHOD` must be one of: [oidc, local, discord] if set.');
        }
    }
};
