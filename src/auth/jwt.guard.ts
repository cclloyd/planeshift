import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { parseCookies } from '../util.js'; // Or whatever you use
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { UsersService } from './users/users.service.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private readonly usersService: UsersService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const cookies = parseCookies(request.headers.cookie);
        const token = cookies['access_token'];
        if (!token) return false;

        try {
            const decoded = jwtDecode(token);
            const user = await this.usersService.findOne(decoded.sub as string);
            const currentTime = Math.floor(Date.now() / 1000);
            if (decoded.exp && decoded.exp < currentTime) return false;
            if (user) request.user = user.toObject();
            return !!user;
        } catch (error) {
            return false;
        }
    }
}
