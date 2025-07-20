import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { FoundryModule } from '../foundry/foundry.module.js';
import { GameModule } from '../game/game.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { MongooseModule } from '@nestjs/mongoose';
import { dotEnv } from '../env.js';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
    imports: [
        FoundryModule,
        GameModule,
        AuthModule,
        MongooseModule.forRoot(`mongodb://${dotEnv.MONGO_USER}:${dotEnv.MONGO_PASS}@${dotEnv.MONGO_HOST}:${dotEnv.MONGO_PORT}/${dotEnv.MONGO_DB}`),
        ServeStaticModule.forRoot({ rootPath: join(process.cwd(), 'src', 'resources'), serveRoot: '/api/static' }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
