import { Injectable, Req } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-openidconnect';
import { dotEnv } from '../env.js';
import { UsersService } from './users/users.service.js';
import { ApiKeysService } from './apikeys/apikeys.service.js';
import { JwtService } from '@nestjs/jwt';
import { TokenResponse } from './types.js';
import { jwtDecode } from 'jwt-decode';
import { createHash } from 'crypto';
import { Request } from 'express';

@Injectable()
export class OpenIdConnectStrategy extends PassportStrategy(Strategy, 'openidconnect') {
    constructor(
        private users: UsersService,
        private apiKey: ApiKeysService,
        private jwt: JwtService,
    ) {
        super({
            issuer: dotEnv.OIDC_ISSUER!,
            clientID: dotEnv.OIDC_CLIENT_ID!,
            clientSecret: dotEnv.OIDC_CLIENT_SECRET!,
            callbackURL: `/api/auth/oidc/callback`,
            authorizationURL: `${dotEnv.OIDC_ISSUER!}/protocol/openid-connect/auth`,
            tokenURL: `${dotEnv.OIDC_ISSUER!}/protocol/openid-connect/token`,
            userInfoURL: `${dotEnv.OIDC_ISSUER!}/protocol/openid-connect/userinfo`,
            passReqToCallback: true, // To handle the request object in the callback
            scope: ['openid', 'profile', 'email', ...dotEnv.OIDC_EXTRA_SCOPES!],
        });
    }

    /**
     * Validate method: Process the profile and tokens after successful authentication.
     *
     * @param req - The original request object
     * @param issuer - URL of the OpenID provider
     * @param profile - User's profile data returned by the provider
     * @param idToken - ID Token returned by the provider
     * @param accessToken - Access Token returned by the provider
     * @param refreshToken - (Optional) Refresh Token returned by the provider
     * @returns User object to attach to the request
     */
    //async validate(req: any, issuer: string, profile?: any, idToken?: string, accessToken?: string, refreshToken?: string) {
    async validate(@Req() req: Request, code: string, state: string) {
        const origin = req.get('origin') ?? `${req.protocol}://${req.get('host')}`;
        const REDIRECT_URI = `${origin}/api/auth/oidc/callback`;
        const data = new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
            client_id: dotEnv.OIDC_CLIENT_ID!,
            client_secret: dotEnv.OIDC_CLIENT_SECRET!,
        });
        let response = await fetch(`${dotEnv.OIDC_ISSUER}/protocol/openid-connect/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: data.toString(),
        });

        const responseData = (await response.json()) as TokenResponse;
        const accessToken = jwtDecode(responseData.access_token);

        let user = await this.users.findOneByOidc(accessToken.sub!);
        if (!user) {
            response = await fetch(`${dotEnv.OIDC_ISSUER}/protocol/openid-connect/userinfo`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${responseData.access_token}`,
                },
                body: data.toString(),
            });
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const userInfo = await response.json();
            user = await this.users.create({
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                username: `${userInfo.preferred_username}`,
                // @ts-expect-error
                email: `${accessToken.email}`,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                avatar:
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    userInfo.picture ??
                    `https://www.gravatar.com/avatar/${createHash('md5')
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
                        .update(userInfo.email!.toLowerCase() || '')
                        .digest('hex')}?d=mp`,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
                oidc_id: userInfo.sub,
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
}
