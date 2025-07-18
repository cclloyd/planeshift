import { Controller, Get, HttpException, HttpStatus, Optional, Query, Req, Request, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service.js';
import { DiscordStrategy } from './discord.strategy.js';
import { Response } from 'express';
import { ApiAuthGuard } from './api.guard.js';
import { OpenIdConnectStrategy } from './oidc.strategy.js';
import { ReqUser } from './user.decorator.js';
import { UserDocument } from './users/schemas/users.schema.js';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly auth: AuthService,
        @Optional() private readonly oidc?: OpenIdConnectStrategy,
        @Optional() private readonly discord?: DiscordStrategy,
    ) {}

    // TODO: Merge users on login stead of creating users with the same username and different oidc_ids

    @UseGuards(ApiAuthGuard)
    @Get('login')
    login(@ReqUser() user: UserDocument) {
        return user;
    }

    @UseGuards(ApiAuthGuard)
    @Get('auth/logout')
    async logout(@Request() req: Request) {
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call
        return req.logout();
    }

    @Get('oidc/callback')
    async oidcCallback(@Req() req: Request, @Res() res: Response, @Query('code') code: string, @Query('state') state: string) {
        if (!this.oidc) throw new HttpException(`OIDC auth is not enabled.`, HttpStatus.NOT_FOUND);
        const accessToken = await this.oidc.validate(req, code, state);
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
            sameSite: 'lax',
            path: '/',
        });
        res.redirect('/api/game/');
    }

    @Get('discord/callback')
    async discordCallback(@Req() req: Request, @Res() res: Response, @Query('code') code: string, @Query('state') state: string) {
        if (!this.discord) throw new HttpException(`Discord auth is not enabled.`, HttpStatus.NOT_FOUND);
        const accessToken = await this.discord.validate(code, state);
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
            sameSite: 'lax',
            path: '/',
        });
        // TODO: Redirect to original page
        res.redirect('/api/game/');
    }
}
