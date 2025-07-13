import { Module } from '@nestjs/common';
import { ActorsModule } from './actors/actors.module.js';
import { MessagesModule } from './messages/messages.module.js';
import { GameService } from './game.service.js';
import { GameController } from './game.controller.js';
import { FoundryModule } from '../foundry/foundry.module.js';
import { RouterModule } from '@nestjs/core';
import { ScenesModule } from './scenes/scenes.module.js';

@Module({
    imports: [
        FoundryModule,
        ActorsModule,
        MessagesModule,
        ScenesModule,
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
    providers: [GameService],
})
export class GameModule {}
