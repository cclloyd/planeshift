import { Controller, Get, Param } from '@nestjs/common';
import { ActorsService } from './actors.service.js';

@Controller()
export class ActorsController {
    constructor(private readonly actors: ActorsService) {}

    @Get()
    async findAll() {
        return await this.actors.getAllActors();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return await this.actors.getActor(id);
    }
}
