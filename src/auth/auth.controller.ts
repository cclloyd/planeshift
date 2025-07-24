import { Controller, Get, HttpException, HttpStatus, Optional, Query, Req, Res, UseGuards } from '@nestjs/common';
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { AuthService } from './auth.service.js';
import { DiscordStrategy } from './discord.strategy.js';
import { ApiAuthGuard } from './api.guard.js';
import { OpenIdConnectStrategy } from './oidc.strategy.js';
import { User, UserDocument } from './users/schemas/users.schema.js';
import { ReqUser } from './users/user.decorator.js';
import { ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiSecurity('tokenAuth')
@ApiTags('Auth')
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
    @ApiOperation({ summary: 'Login and get info', description: 'Triggers login flow and returns the authenticated user info.' })
    @ApiOkResponse({ description: 'Authenticated user profile.', type: User })
    login(@ReqUser() user: UserDocument) {
        return user;
    }

    @UseGuards(ApiAuthGuard)
    @Get('auth/logout')
    @ApiOperation({ summary: 'Logout', description: 'Logs out the current user session.' })
    @ApiNoContentResponse({ description: 'User successfully logged out.' })
    async logout(@Req() req: ExpressRequest) {
        // @ts-expect-error
        return req.logout();
    }

    @Get('oidc/callback')
    @ApiOperation({ summary: 'OIDC callback', description: 'Handles the OpenID Connect provider callback.' })
    @ApiResponse({ status: 302, description: 'Redirects to the game API endpoint after successful login.' })
    async oidcCallback(@Req() req: ExpressRequest, @Res() res: ExpressResponse, @Query('code') code: string, @Query('state') state: string) {
        if (!this.oidc) throw new HttpException(`OIDC auth is not enabled.`, HttpStatus.NOT_FOUND);
        const accessToken = await this.oidc.validate(req, code, state);
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: req.secure,
            maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
            sameSite: 'lax',
            path: '/',
        });
        res.redirect('/api/swagger/');
    }

    @Get('discord/callback')
    @ApiOperation({ summary: 'Discord callback', description: 'Handles the Discord OAuth callback.' })
    @ApiResponse({ status: 302, description: 'Redirects to the game API endpoint after successful login.' })
    async discordCallback(@Req() req: ExpressRequest, @Res() res: ExpressResponse, @Query('code') code: string, @Query('state') state: string) {
        if (!this.discord) throw new HttpException(`Discord auth is not enabled.`, HttpStatus.NOT_FOUND);
        const accessToken = await this.discord.validate(req, code, state);
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
            sameSite: 'lax',
            path: '/',
        });
        // TODO: Redirect to original page
        res.redirect('/api/swagger/');
    }
}
