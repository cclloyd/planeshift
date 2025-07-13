import { Controller, Get, Param } from '@nestjs/common';
import { ScenesService } from './scenes.service.js';
import { FoundryService } from '../../foundry/foundry.service.js';

@Controller()
export class ScenesController {
    constructor(
        private readonly scenesService: ScenesService,
        private readonly foundry: FoundryService,
    ) {}

    @Get()
    async findAll() {
        return (await this.foundry.runFoundry(() => {
            return game.scenes!.contents.map((scene: Scene) => ({
                ...scene,
                _id: scene._id as string,
            }));
        })) as Scene[];
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return (await this.foundry.runFoundry((actorId: string) => {
            const scene = game.scenes!.get(actorId);
            return {
                ...scene,
                _id: scene!._id,
            };
        }, id)) as Scene;
    }
}
