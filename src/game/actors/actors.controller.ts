import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ActorsService } from './actors.service.js';
import { ApiAuthGuard } from '../../auth/api.guard.js';

@UseGuards(ApiAuthGuard)
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
