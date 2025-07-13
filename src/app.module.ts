import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { FoundryModule } from './foundry/foundry.module.js';
import { GameModule } from './game/game.module.js';

@Module({
    imports: [FoundryModule, GameModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
