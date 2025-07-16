import { Controller, Get, Query, Req, Request, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service.js';
import { DiscordStrategy } from './discord.strategy.js';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly auth: AuthService,
        private readonly discord: DiscordStrategy,
    ) {}

    @UseGuards(AuthGuard('discord'))
    @Get('login')
    login() {
        return;
    }

    @UseGuards(AuthGuard('discord'))
    @Get('auth/logout')
    async logout(@Request() req: Request) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call
        return req.logout();
    }

    @Get('oidc/callback')
    oidcCallback(@Request() req: Request) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return req.user;
    }

    @Get('discord/callback')
    async discordCallback(@Req() req: Request, @Res() res: Response, @Query('code') code: string, @Query('state') state: string) {
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
