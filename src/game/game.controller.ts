import { Controller, Get } from '@nestjs/common';
import { GameService } from './game.service.js';

@Controller()
export class GameController {
    constructor(private readonly game: GameService) {}

    @Get()
    async getGame() {
        return await this.game.getGame();
    }

    @Get('world')
    async getWorld() {
        return await this.game.getWorld();
    }

    @Get('system')
    async getSystem() {
        return await this.game.getSystem();
    }
}
