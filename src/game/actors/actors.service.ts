import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FoundryService } from '../../foundry/foundry.service.js';
import { PaginatedActors } from './types.js';

@Injectable()
export class ActorsService {
    constructor(private readonly foundry: FoundryService) {}

    async paginateResults(input: unknown[], page: number = 1, limit: number = 100, order: 'asc' | 'desc' = 'desc') {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginated = (order === 'desc' ? input.reverse() : input).slice(startIndex, endIndex);

        return {
            data: paginated,
            length: paginated.length,
            total: input.length,
            page: page,
            totalPages: Math.ceil(input.length / limit),
            limit: limit,
        } as PaginatedActors;
    }

    async getAllActors(page: number = 1, limit: number = 100, order: 'asc' | 'desc' = 'desc') {
        const actors = (await this.foundry.runFoundry(() => {
            return game.data!.actors!;
        })) as Actor[];
        return this.paginateResults(actors, page, limit, order);
    }

    async getPlayerActors(page: number = 1, limit: number = 100, order: 'asc' | 'desc' = 'desc') {
        const actors = (await this.foundry.runFoundry(() => {
            // @ts-expect-error
            return game.actors.filter((actor) => actor.hasPlayerOwner);
        })) as Actor[];
        return this.paginateResults(actors, page, limit, order);
    }

    async getActor(id: string) {
        const actor = (await this.foundry.runFoundry((actorId: string) => {
            return game.actors!.get(actorId) ?? game.actors!.getName(actorId);
        }, id)) as Actor;
        if (!actor) throw new HttpException(`Actor ${id} not found.`, HttpStatus.NOT_FOUND);
        return actor;
    }
}
