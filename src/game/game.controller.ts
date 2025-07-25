import { Controller, Get, Req, Request, UseGuards } from '@nestjs/common';
import { GameService } from './game.service.js';
import { ApiAuthGuard } from '../auth/api.guard.js';
import { ApiOkResponse, ApiOperation, ApiSecurity } from '@nestjs/swagger';

@ApiSecurity('tokenAuth')
@UseGuards(ApiAuthGuard)
@Controller()
export class GameController {
    constructor(private readonly game: GameService) {}

    // TODO: Add endpoint to restart game connection

    @Get()
    @ApiOperation({
        summary: 'Get full game data',
        description: 'Returns the full game data of the running game.  This may take longer than the other endpoints to complete.',
    })
    @ApiOkResponse({ description: "The current game's data." })
    async getGame(@Req() req: Request) {
        return await this.game.getGame();
    }

    @Get('world')
    @ApiOperation({ summary: 'Get world info', description: 'Returns details about the active world in Foundry.' })
    @ApiOkResponse({ description: 'Active world details.' })
    async getWorld() {
        return await this.game.getWorld();
    }

    @Get('system')
    @ApiOperation({ summary: 'Get system info', description: 'Returns the running system for the game.' })
    @ApiOkResponse({ description: 'Foundry system information.' })
    async getSystem() {
        return await this.game.getSystem();
    }
}
