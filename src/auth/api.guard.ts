import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ApiKeyAuthGuard } from './apikeys/apikeys.guard.js';
import { DiscordAuthGuard } from './auth.guard.js';
import { JwtAuthGuard } from './jwt.guard.js';
import { dotEnv } from '../env.js';

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

        if (dotEnv.AUTH_METHOD === 'disabled') {
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

        // Try the Discord passport guard
        try {
            const discordGuard = new DiscordAuthGuard();
            // Do connectToFoundry first to set access_token in cookies on successful connectToFoundry.
            await discordGuard.canActivate(context);
            // Try JWT one more time to inject user now that access_token is set
            if (await this.jwtGuard.canActivate(context)) return true;
        } catch {
            /* empty */
        }

        throw new UnauthorizedException();
    }
}
