import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-openidconnect';
import { dotEnv } from '../env.js';

@Injectable()
export class OpenIdConnectStrategy extends PassportStrategy(Strategy, 'openidconnect') {
    constructor() {
        super({
            issuer: dotEnv.OIDC_ISSUER!,
            clientID: dotEnv.OIDC_CLIENT_ID!,
            clientSecret: dotEnv.OIDC_CLIENT_SECRET!,
            callbackURL: 'http://localhost:3000/api/auth/oidc/callback',
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
    async validate(req: any, issuer: string, profile: any, idToken: string, accessToken: string, refreshToken: string) {
        const user = {
            issuer,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            profile,
            idToken,
            accessToken,
            refreshToken,
        };

        // TODO: Compare returned user against Users in database and connect/connectToFoundry

        return user;
    }

}
