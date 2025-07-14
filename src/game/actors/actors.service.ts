import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FoundryService } from '../../foundry/foundry.service.js';

@Injectable()
export class ActorsService {
    constructor(private readonly foundry: FoundryService) {}

    async getAllActors() {
        return (await this.foundry.runFoundry(() => {
            return game.data!.actors!;
        })) as Actor[];
    }

    async getPlayerActors() {
        return (await this.foundry.runFoundry(() => {
            return game.data!.actors!;
        })) as Actor[];
    }

    async getActor(id: string) {
        const actor = (await this.foundry.runFoundry((actorId: string) => {
            return game.actors!.get(actorId) ?? game.actors!.getName(actorId);
        }, id)) as Actor;
        if (!actor) throw new HttpException(`Actor ${id} not found.`, HttpStatus.NOT_FOUND);
        return actor;
    }
}
