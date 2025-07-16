import { Module } from '@nestjs/common';
import { ActorsModule } from './actors/actors.module.js';
import { MessagesModule } from './messages/messages.module.js';
import { GameService } from './game.service.js';
import { GameController } from './game.controller.js';
import { FoundryModule } from '../foundry/foundry.module.js';
import { RouterModule } from '@nestjs/core';
import { ScenesModule } from './scenes/scenes.module.js';
import { ApiKeysModule } from '../auth/apikeys/apikeysModule.js';
import { UsersModule } from '../auth/users/users.module.js';
import { ApiAuthGuard } from '../auth/api.guard.js';
import { ApiKeyAuthGuard } from '../auth/apikeys/apikeys.guard.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
    imports: [
        FoundryModule,
        ActorsModule,
        MessagesModule,
        ScenesModule,
        UsersModule,
        ApiKeysModule,
        AuthModule,
        RouterModule.register([
            {
                path: 'game',
                module: GameModule,
                children: [
                    {
                        path: 'messages',
                        module: MessagesModule,
                    },
                    {
                        path: 'actors',
                        module: ActorsModule,
                    },
                    {
                        path: 'scenes',
                        module: ScenesModule,
                    },
                ],
            },
        ]),
    ],
    controllers: [GameController],
    providers: [GameService, ApiAuthGuard, ApiKeyAuthGuard],
})
export class GameModule {}
