import { Injectable } from '@nestjs/common';
import { FoundryService } from '../../foundry/foundry.service.js';

@Injectable()
export class ScenesService {
    constructor(private readonly foundry: FoundryService) {}

    async getAllScenes() {
        return (await this.foundry.runFoundry(() => {
            return game.data!.scenes!;
        })) as Scene[];
    }

    async getScene(id: string) {
        return (await this.foundry.runFoundry((sceneId: string) => {
            return game.scenes!.get(sceneId) ?? game.scenes!.getName(sceneId);
        }, id)) as Scene;
    }
}
