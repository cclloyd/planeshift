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
            callbackURL: `/api/auth/discord/callback`,
            authorizationURL: `${issuer}/api/oauth2/authorize`,
            tokenURL: `${issuer}/api/oauth2/token`,
            userInfoURL: `${issuer}/api/oauth2/userinfo`,
            passReqToCallback: true,
            scope: ['openid', 'guilds', 'guilds.members.read', 'identify', 'email'],
        });
    }

    /**
     * Validate method: Process the profile and tokens after successful authentication.
     *
     * @returns User object to attach to the request
     * @param req
     * @param code
     * @param state
     */
    async validate(@Req() req: Request, code: string, state: string) {
        return this.auth.validateDiscordUser(req, code, state);
    }
}
