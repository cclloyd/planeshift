import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { UsersModule } from './users/users.module.js';
import { PassportModule } from '@nestjs/passport';
import { OpenIdConnectStrategy } from './oidc.strategy.js';
import { DiscordStrategy } from './discord.strategy.js';
import { dotEnv } from '../env.js';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants.js';
import { ApiKeysModule } from './apikeys/apikeysModule.js';
import { JwtAuthGuard } from './jwt.guard.js';
import { ApiAuthGuard } from './api.guard.js';
import { ApiKeyAuthGuard } from './apikeys/apikeys.guard.js';

@Module({
    imports: [
        UsersModule,
        ApiKeysModule,
        PassportModule,
        JwtModule.register({
            global: true,
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '300s' },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtAuthGuard, ApiAuthGuard, ApiKeyAuthGuard, dotEnv.AUTH_METHOD === 'oidc' ? OpenIdConnectStrategy : DiscordStrategy],
    exports: [AuthService, JwtAuthGuard, ApiAuthGuard, ApiKeyAuthGuard],
})
export class AuthModule {}
