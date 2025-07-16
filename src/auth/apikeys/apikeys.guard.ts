import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { ApiKeysService } from './apikeys.service.js';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
    constructor(
        private apiKeys: ApiKeysService,
        private users: UsersService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const authHeader = request.headers['authorization'] as string;
        if (!authHeader || !authHeader.trim().startsWith('Token ')) throw new UnauthorizedException(`Missing or malformed Authorization header: ${authHeader}`);

        const token = authHeader.substring(6).trim();
        if (!token) throw new UnauthorizedException('API key is missing in Authorization header.');

        if (!token) throw new UnauthorizedException('API key missing');

        const apiKeyRecord = await this.apiKeys.findOne({ token: token });
        if (!apiKeyRecord) throw new UnauthorizedException('Invalid API key');

        const user = await this.users.findOne(apiKeyRecord.user);
        if (!user) throw new UnauthorizedException('Invalid API key');

        // Attach user to request
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (request as any).user = user;
        return true;
    }
}
