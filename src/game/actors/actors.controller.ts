import { Controller, Get, Param, ParseBoolPipe, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ActorsService } from './actors.service.js';
import { ApiAuthGuard } from '../../auth/api.guard.js';

@UseGuards(ApiAuthGuard)
@Controller()
export class ActorsController {
    constructor(private readonly actors: ActorsService) {}

    @Get()
    async findAll(
        @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
        @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 100,
        @Query('order') order: 'asc' | 'desc' = 'desc',
    ) {
        return await this.actors.getAllActors(page, limit, order);
    }

    @Get('players')
    async findPlayerActors(
        @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
        @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 100,
        @Query('order') order: 'asc' | 'desc' = 'desc',
    ) {
        return await this.actors.getPlayerActors(page, limit, order);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return await this.actors.getActor(id);
    }
}
