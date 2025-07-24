import { Injectable, Req } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-openidconnect';
import { dotEnv } from '../env.js';
import { AuthService } from './auth.service.js';
import { Request } from 'express';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
    constructor(private readonly auth: AuthService) {
        const issuer = 'https://discord.com';
        super({
            issuer: issuer,
            clientID: dotEnv.DISCORD_CLIENT_ID!,
            clientSecret: dotEnv.DISCORD_CLIENT_SECRET!,
            callbackURL: ``,
            authorizationURL: `${issuer}/api/oauth2/authorize`,
            tokenURL: `${issuer}/api/oauth2/token`,
            userInfoURL: `${issuer}/api/oauth2/userinfo`,
            passReqToCallback: true,
            scope: ['openid', 'guilds', 'guilds.members.read', 'identify', 'email'],
        });
    }

    override authenticate(req: Request, options?: Record<string, unknown>): void {
        const origin = req.get('origin') ?? `${req.protocol}://${req.get('host')}`;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (this as any)._oauth2._callbackURL = `${origin}/api/auth/oidc/callback`;
        super.authenticate(req, options);
    }

    /**
     * Validate method: Process the profile and tokens after successful authentication.
     *
     * @returns User object to attach to the request
     * @param req
     * @param code
     * @param state
     */
    //async validate(req: any, issuer: string, profile: any, idToken: string, accessToken: string, refreshToken: string) {
    async validate(@Req() req: Request, code: string, state: string) {
        return this.auth.validateDiscordUser(req, code, state);
    }
}
