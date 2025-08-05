import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from './users/users.service.js';
import { JwtService } from '@nestjs/jwt';
import { dotEnv } from '../env.js';
import { APIGuildMember, APIUser } from 'discord-api-types/v10';
import { User } from './users/schemas/users.schema.js';
import { ApiKeysService } from './apikeys/apikeys.service.js';
import { Request } from 'express';

@Injectable()
export class AuthService {
    constructor(
        private users: UsersService,
        private apiKey: ApiKeysService,
        private jwt: JwtService,
    ) {}

    async validateDiscordUser(req: Request, code: string, state?: string) {
        const origin = req.get('origin') ?? `${req.protocol}://${req.get('host')}`;
        const REDIRECT_URI = `${origin}/api/auth/discord/callback`;
        const data = new URLSearchParams({
            grant_type: 'authorization_code',
            redirect_uri: REDIRECT_URI,
            code: code,
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
        return this.jwt.sign(payload, { expiresIn: '7d' });
    }

    async login(user: User) {
        const payload = { username: user.username, sub: user.oidc_id };
        return {
            access_token: this.jwt.sign(payload, { expiresIn: '24h' }),
        };
    }
}
