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
import { UsersController } from './users/users.controller.js';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UsersSchema } from './users/schemas/users.schema.js';
import { ApiKey, ApiKeysSchema } from './apikeys/schemas/apikeys.schema.js';

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
        MongooseModule.forFeature([{ name: User.name, schema: UsersSchema }]),
        MongooseModule.forFeature([{ name: ApiKey.name, schema: ApiKeysSchema }]),
    ],
    controllers: [AuthController, UsersController],
    providers: [
        AuthService,
        JwtAuthGuard,
        ApiAuthGuard,
        ApiKeyAuthGuard,
        ...(dotEnv.OIDC_ISSUER ? [OpenIdConnectStrategy] : []),
        ...(dotEnv.DISCORD_CLIENT_ID ? [DiscordStrategy] : []),
    ],
    exports: [AuthService, JwtAuthGuard, ApiAuthGuard, ApiKeyAuthGuard],
})
export class AuthModule {}
