import { Controller, Get, Req, Request, UseGuards } from '@nestjs/common';
import { GameService } from './game.service.js';
import { ApiAuthGuard } from '../auth/api.guard.js';

@UseGuards(ApiAuthGuard)
@Controller()
export class GameController {
    constructor(private readonly game: GameService) {}

    @Get()
    async getGame(@Req() req: Request) {
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
