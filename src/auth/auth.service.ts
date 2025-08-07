import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from './users/schemas/users.schema.js';

@Injectable()
export class AuthService {
    constructor(private jwt: JwtService) {}

    async login(user: User) {
        const payload = { username: user.username, sub: user.oidc_id };
        return {
            access_token: this.jwt.sign(payload, { expiresIn: '24h' }),
        };
    }
}
