import { HttpException, HttpStatus, Injectable, Req } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-openidconnect';
import { dotEnv } from '../env.js';
import { Request } from 'express';
import { APIGuildMember, APIUser } from 'discord-api-types/v10';
import { UsersService } from './users/users.service.js';
import { ApiKeysService } from './apikeys/apikeys.service.js';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
    constructor(
        private users: UsersService,
        private apiKey: ApiKeysService,
        private jwt: JwtService,
    ) {
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
        const origin = req.get('origin') ?? `${req.protocol}://${req.get('host')}`;
        const REDIRECT_URI = `${origin}/api/auth/discord/callback`;
        const data = new URLSearchParams({
            grant_type: 'authorization_code',
            redirect_uri: REDIRECT_URI,
            code: code,
            state: state,
            client_id: dotEnv.DISCORD_CLIENT_ID!,
            client_secret: dotEnv.DISCORD_CLIENT_SECRET!,
        });
        let response: Response = await fetch(`https://discord.com/api/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: data.toString(),
        });

        type TokenResponse = {
            access_token: string;
            refresh_token: string;
            expires_in: number;
            token_type: string;
            scope: string;
        };

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const responseData: TokenResponse = await response.json();
        const accessToken = responseData.access_token;

        // Check if user has required role defined in env vars
        response = await fetch(`${dotEnv.DISCORD_API_URL}/users/@me/guilds/${dotEnv.DISCORD_GUILD_ID}/member`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const member = (await response.json()) as APIGuildMember;
        if (!member?.roles?.includes(dotEnv.DISCORD_ROLE_ID!))
            throw new HttpException(`You do not have the required discord role assigned to you.`, HttpStatus.FORBIDDEN);

        // Get info to make user object
        response = await fetch(`${dotEnv.DISCORD_API_URL}/users/@me`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const userInfo: APIUser = await response.json();
        let user = await this.users.findOneByDiscord(userInfo.id);
        if (!user) {
            user = await this.users.create({
                username: userInfo.username,
                email: userInfo.email!,
                avatar: userInfo.avatar!,
                discord_id: userInfo.id,
            });
        }

        // Check if user has ApiKey and create if missing
        const apiKey = await this.apiKey.findOne({ user: user._id });
        if (!apiKey) await this.apiKey.create({ user: user._id });

        const payload = {
            sub: user._id,
            ...user.toObject(),
        };
        return this.jwt.sign(payload, { expiresIn: dotEnv.LOGIN_DURATION });
    }
}