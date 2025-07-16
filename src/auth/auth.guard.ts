import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants.js';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

export const DiscordAuthGuard = AuthGuard('discord');

@Injectable()
export class CustomAuthGuard implements CanActivate {
    constructor(private jwt: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException();
        }
        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const payload = await this.jwt.verifyAsync(token, {
                secret: jwtConstants.secret,
            });
            // 💡 We're assigning the payload to the request object here
            // so that we can access it in our route handlers
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
            request.user = payload;
        } catch {
            throw new UnauthorizedException();
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}