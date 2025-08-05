import { LooseBoolean } from './util.js';
import 'dotenv/config';

export interface FoundryEnv {
    MONGO_HOST: string;
    MONGO_PORT: number;
    MONGO_USER: string;
    MONGO_PASS: string;
    MONGO_DB: string;
    FOUNDRY_HOST: string;
    FOUNDRY_USER: string;
    FOUNDRY_PASS: string;
    FOUNDRY_WORLD?: string;
    FOUNDRY_ADMIN_PASS?: string;
    FOUNDRY_LOG_ENABLED: boolean;
    OIDC_ISSUER?: string;
    OIDC_CLIENT_ID?: string;
    OIDC_CLIENT_SECRET?: string;
    OIDC_EXTRA_SCOPES?: string | string[];
    OIDC_USERNAME_ATTRIBUTE?: string;
    SECRET_KEY: string;
    DISCORD_CLIENT_ID?: string;
    DISCORD_CLIENT_SECRET?: string;
    DISCORD_GUILD_ID?: string;
    DISCORD_ROLE_ID?: string;
    DISCORD_ADMIN_ROLE_ID?: string;
    DISCORD_GM_ROLE_ID?: string;
    DISCORD_API_URL: string;
    API_VERSION: string;
    REDIS_ENABLED: boolean;
    REDIS_HOST: string;
    REDIS_PORT: number;
    REDIS_USER?: string;
    REDIS_PASS?: string;
    REDIS_DB?: string;
    LOGIN_DURATION: string;
    AUTH_PROVIDERS: string[];
}

export const dotEnv: FoundryEnv = {
    API_VERSION: process.env.API_VERSION ?? `dev-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
    AUTH_PROVIDERS: (process.env.LOGIN_DURATION ?? 'discord,oidc').split(','),
    FOUNDRY_HOST: process.env.FOUNDRY_HOST!,
    FOUNDRY_USER: process.env.FOUNDRY_USER ?? 'APIUser',
    FOUNDRY_PASS: process.env.FOUNDRY_PASS!,
    FOUNDRY_ADMIN_PASS: process.env.FOUNDRY_ADMIN_PASS,
    FOUNDRY_WORLD: process.env.FOUNDRY_WORLD,
    FOUNDRY_LOG_ENABLED: new LooseBoolean(process.env.FOUNDRY_LOG_ENABLED).valueOf(),
    OIDC_ISSUER: process.env.OIDC_ISSUER,
    OIDC_CLIENT_ID: process.env.OIDC_CLIENT_ID,
    OIDC_CLIENT_SECRET: process.env.OIDC_CLIENT_SECRET,
    OIDC_EXTRA_SCOPES: process.env.OIDC_EXTRA_SCOPES ? process.env.OIDC_EXTRA_SCOPES.split(' ') : [],
    OIDC_USERNAME_ATTRIBUTE: process.env.OIDC_USERNAME_ATTRIBUTE,
    SECRET_KEY: process.env.SECRET_KEY!,
    MONGO_HOST: process.env.MONGO_HOST ?? 'localhost',
    MONGO_PORT: process.env.MONGO_PORT ? parseInt(process.env.MONGO_PORT) : 27017,
    MONGO_DB: process.env.MONGO_DB ?? 'planeshift',
    MONGO_USER: process.env.MONGO_USER ?? 'planeshift',
    MONGO_PASS: process.env.MONGO_PASS ?? 'planeshift',
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    DISCORD_GUILD_ID: process.env.DISCORD_GUILD_ID,
    DISCORD_ROLE_ID: process.env.DISCORD_ROLE_ID,
    DISCORD_GM_ROLE_ID: process.env.DISCORD_GM_ROLE_ID,
    DISCORD_ADMIN_ROLE_ID: process.env.DISCORD_ADMIN_ROLE_ID,
    DISCORD_API_URL: process.env.DISCORD_API_URL ?? 'https://discord.com/api/v10',
    REDIS_ENABLED: new LooseBoolean(process.env.REDIS_ENABLED).valueOf(),
    REDIS_HOST: process.env.REDIS_HOST ?? 'localhost',
    REDIS_PORT: Number(process.env.REDIS_PORT ?? 6379),
    REDIS_USER: process.env.REDIS_USER ?? undefined,
    REDIS_PASS: process.env.REDIS_PASS ?? undefined,
    REDIS_DB: process.env.REDIS_DB ?? '0',
    LOGIN_DURATION: process.env.LOGIN_DURATION ?? '7d',
};

export const requireEnv = () => {
    if (!process.env.SECRET_KEY) throw new Error('Environment variable `SECRET_KEY` not set. Generate one by running `openssl rand -base64 48`');

    if (!process.env.FOUNDRY_HOST) throw new Error('Environment variable `FOUNDRY_HOST` not set.');
    if (!process.env.FOUNDRY_PASS) throw new Error('Environment variable `FOUNDRY_PASS` not set.');

    if (process.env.AUTH_METHOD) {
        if (!['oidc', 'local', 'discord', 'disabled'].includes(process.env.AUTH_METHOD)) {
            throw new Error('Environment variable `AUTH_METHOD` must be one of: [oidc, discord, disabled] if set.');
        }
    }
    if (process.env.AUTH_METHOD === 'disabled') {
        console.warn('Environment variable `AUTH_METHOD` is set to `disabled`. API will be fully visible to anyone that can access it.');
    }

    if (process.env.AUTH_METHOD === 'discord') {
        if (!process.env.DISCORD_CLIENT_ID) throw new Error('Environment variable `DISCORD_CLIENT_ID` is required when AUTH_PROVIDER is set to discord.');
        if (!process.env.DISCORD_CLIENT_SECRET)
            throw new Error('Environment variable `DISCORD_CLIENT_SECRET` is required when AUTH_PROVIDER is set to discord.');
        if (!process.env.DISCORD_GUILD_ID)
            console.warn(
                'Environment variable `DISCORD_GUILD_ID` is recommended when AUTH_PROVIDER is set to discord, otherwise anyone with a discord account can authenticate.',
            );
        if (!process.env.DISCORD_ROLE_ID)
            console.warn(
                'Environment variable `DISCORD_ROLE_ID` is recommended when AUTH_PROVIDER is set to discord, otherwise anyone in your specified discord guild authenticate.',
            );
        if (!process.env.DISCORD_ADMIN_ROLE_ID)
            console.warn(
                'Environment variable `DISCORD_ADMIN_ROLE_ID` is recommended when AUTH_PROVIDER is set to discord, otherwise anyone who authenticates will be an admin.',
            );
        if (!process.env.DISCORD_GM_ROLE_ID)
            console.warn(
                'Environment variable `DISCORD_GM_ROLE_ID` is recommended when AUTH_PROVIDER is set to discord, otherwise all players will be treated as having GM access to game resources.',
            );
    }

    if (process.env.AUTH_METHOD === 'oidc') {
        if (!process.env.OIDC_CLIENT_ID) throw new Error('Environment variable `OIDC_CLIENT_ID` is required when AUTH_PROVIDER is set to oidc.');
        if (!process.env.OIDC_CLIENT_SECRET) throw new Error('Environment variable `OIDC_CLIENT_SECRET` is required when AUTH_PROVIDER is set to oidc.');
    }
};
