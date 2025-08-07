import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ApiKeyAuthGuard } from './apikeys/apikeys.guard.js';
import { JwtAuthGuard } from './jwt.guard.js';
import { dotEnv } from '../env.js';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';

/**
 * A composite guard that combines multiple authentication methods.
 * Authentication guards are executed in sequence, and access is granted if any guard returns true.
 * Current supported authentication methods:
 * - API Key authentication
 * - Discord OAuth authentication
 * - Generic OIDC Authentication (exclusive with Discord auth)
 */
@Injectable()
export class ApiAuthGuard implements CanActivate {
    constructor(
        private readonly apiKeyGuard: ApiKeyAuthGuard,
        private readonly jwtGuard: JwtAuthGuard,
    ) {}

    getAuthenticateOptions(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest<Request>();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        return { state: (request as any).oauthState };
    }

    /**
     * Determines if the current request is allowed to proceed.
     * Tries multiple authentication methods in sequence:
     * 1. API Key authentication
     * 2. Discord OAuth authentication
     *
     * @param context - The execution context containing the request details
     * @returns Promise resolving to true if authentication succeeds, throws UnauthorizedException otherwise
     * @throws UnauthorizedException when all authentication methods fail
     */
    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Note: We catch errors here because they throw some kind of unauthorized error usually.

        if (dotEnv.AUTH_PROVIDERS.length === 0) {
            return true;
        }

        // Try API guard
        try {
            if (await this.apiKeyGuard.canActivate(context)) return true;
        } catch {
            /* empty */
        }

        // Try JWT guard
        try {
            if (await this.jwtGuard.canActivate(context)) return true;
        } catch {
            /* empty */
        }

        // If we reach this point, the user will need to reauthenticate.  We will go down the line of enabled providers.

        const request = context.switchToHttp().getRequest<Request>();
        const redirectUrl = `${request.protocol}://${request.host}${request.originalUrl}`;
        const res = request.res;
        if (res) {
            res.cookie('login_redirect', redirectUrl, {
                httpOnly: true,
                secure: request.secure,
                maxAge: 5 * 60 * 1000,
                sameSite: 'lax',
                path: '/',
            });
        }

        // Define login strategies that require authentication to call in the order we want later
        const loginStrategies = {
            discord: async () => {
                if (dotEnv.DISCORD_CLIENT_ID) {
                    const DiscordAuth = AuthGuard('discord');
                    const guard = new DiscordAuth();
                    const result = guard.canActivate(context);
                    if (typeof result === 'boolean') {
                        return result;
                    } else if (result instanceof Promise) {
                        return await result;
                    } else if ('subscribe' in result && typeof result.subscribe === 'function') {
                        // It's an Observable
                        return await firstValueFrom(result);
                    }
                }
            },
            oidc: async () => {
                if (dotEnv.OIDC_CLIENT_ID) {
                    const OIDCAuth = AuthGuard('openidconnect');
                    const guard = new OIDCAuth();
                    const result = guard.canActivate(context);
                    if (typeof result === 'boolean') {
                        return result;
                    } else if (result instanceof Promise) {
                        return await result;
                    } else if ('subscribe' in result && typeof result.subscribe === 'function') {
                        // It's an Observable
                        return await firstValueFrom(result);
                    }
                }
            },
        };

        for (const provider of dotEnv.AUTH_PROVIDERS) {
            if (provider in loginStrategies) {
                const result = await loginStrategies[provider as keyof typeof loginStrategies]();
                if (result) {
                    return result;
                }
            }
        }

        return false;
    }
}
