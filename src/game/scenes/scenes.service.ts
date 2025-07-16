import { Injectable } from '@nestjs/common';
import { FoundryService } from '../../foundry/foundry.service.js';
import { PaginatedScenes } from './types.js';

@Injectable()
export class ScenesService {
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
        } as PaginatedScenes;
    }

    async getAllScenes() {
        const scenes = (await this.foundry.runFoundry(() => {
            return game.data!.scenes!;
        })) as Scene[];
        return await this.paginateResults(scenes);
    }

    async getScene(id: string) {
        return (await this.foundry.runFoundry((sceneId: string) => {
            return game.scenes!.get(sceneId) ?? game.scenes!.getName(sceneId);
        }, id)) as Scene;
    }
}
