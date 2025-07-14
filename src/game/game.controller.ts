import { Controller, Get } from '@nestjs/common';
import { FoundryService } from '../foundry/foundry.service.js';

@Controller()
export class GameController {
    constructor(private readonly foundry: FoundryService) {}

    @Get()
    async getGame() {
        return (await this.foundry.runFoundry(() => {
            return game.data;
        })) as Game;
    }

    @Get('world')
    async getWorld() {
        return (await this.foundry.runFoundry(() => {
            return game.data!.world;
        })) as World;
    }

    @Get('system')
    async getSystem() {
        return (await this.foundry.runFoundry(() => {
            return game.data!.system;
        })) as System;
    }
}
