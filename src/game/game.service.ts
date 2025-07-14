import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FoundryService } from '../foundry/foundry.service.js';

@Injectable()
export class GameService {
    constructor(private readonly foundry: FoundryService) {}

    async getWorld() {
        const world = (await this.foundry.runFoundry(() => {
            return game.data!.world;
        })) as World;
        if (!world) throw new HttpException(`World not found.  Is the game loaded?`, HttpStatus.NOT_FOUND);
        return world;
    }

    async getSystem() {
        const system = (await this.foundry.runFoundry(() => {
            return game.data!.system;
        })) as System;
        if (!system) throw new HttpException(`World not found.  Is the game loaded?`, HttpStatus.NOT_FOUND);
        return system;
    }

    async getGame() {
        const gameData = (await this.foundry.runFoundry(() => {
            return game.data;
        })) as Game;
        if (!gameData) throw new HttpException(`World not found.  Is the game loaded?`, HttpStatus.NOT_FOUND);
        return gameData;
    }
}
