import { Body, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FoundryService } from '../foundry/foundry.service.js';
import { GenericEvalDto } from './dto/eval.dto.js';
import { EvaluateFunc } from 'puppeteer';
import { dotEnv } from '../env.js';
import { UserDocument } from '../auth/users/schemas/users.schema.js';
import { ReqUser } from '../auth/users/user.decorator.js';

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

    async evaluateFunction(@Body() body: GenericEvalDto, @ReqUser() user: UserDocument): Promise<any> {
        if (!dotEnv.EVAL_ENABLED) throw new HttpException('The `evaluate` endpoint is disabled on this server.', HttpStatus.SERVICE_UNAVAILABLE);
        console.log('user', user);
        if (dotEnv.EVAL_ADMIN_ONLY && !user.is_superuser)
            throw new HttpException('The `evaluate` endpoint is disabled on this server.', HttpStatus.SERVICE_UNAVAILABLE);

        const { fn, args } = body;
        const jsFunction = eval(`(${fn})`) as EvaluateFunc<any>;
        return await this.foundry.runFoundry(jsFunction, ...args);
    }
}
