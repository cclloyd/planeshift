import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { User } from './users/schemas/users.schema.js';

export const ReqUser = createParamDecorator((data: keyof User | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();
    const user = req.user as User;
    return data ? user?.[data] : user;
});
