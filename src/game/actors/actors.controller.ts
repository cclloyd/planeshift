import { Controller, Get, HttpException, HttpStatus, Param } from '@nestjs/common';
import { ActorsService } from './actors.service.js';
import { FoundryService } from '../../foundry/foundry.service.js';

@Controller()
export class ActorsController {
    constructor(
        private readonly actorsService: ActorsService,
        private readonly foundry: FoundryService,
    ) {}

    @Get()
    async findAll() {
        return (await this.foundry.runFoundry(() => {
            return game.actors!.contents.map((actor: Actor) => ({
                ...actor,
                _id: actor._id as string,
            }));
        })) as Actor[];
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const actor = (await this.foundry.runFoundry((actorId: string) => {
            const actor = game.actors!.get(actorId) ?? game.actors!.getName(actorId);
            return actor
                ? {
                      ...actor,
                      _id: actor._id,
                  }
                : undefined;
        }, id)) as Actor;
        if (!actor) throw new HttpException(`Actor with id/name ${id} not found`, HttpStatus.NOT_FOUND);
        return actor;
    }
}
