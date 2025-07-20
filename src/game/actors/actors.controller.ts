import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ActorsService } from './actors.service.js';
import { ApiAuthGuard } from '../../auth/api.guard.js';
import { ApiOkResponse, ApiOperation, ApiSecurity } from '@nestjs/swagger';

@ApiSecurity('tokenAuth')
@UseGuards(ApiAuthGuard)
@Controller()
export class ActorsController {
    constructor(private readonly actors: ActorsService) {}

    @Get()
    @ApiOperation({ summary: 'Get all actors', description: 'Retrieve a list of all actors.' })
    @ApiOkResponse({ description: 'Array of actors.', isArray: true })
    async findAll(
        @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
        @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 100,
        @Query('order') order: 'asc' | 'desc' = 'desc',
    ) {
        return await this.actors.getAllActors(page, limit, order);
    }

    @Get('players')
    @ApiOperation({ summary: 'Get player actors', description: 'Retrieve a list of player actors.' })
    @ApiOkResponse({ description: 'Array of player actors.', isArray: true })
    async findPlayerActors(
        @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
        @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 100,
        @Query('order') order: 'asc' | 'desc' = 'desc',
    ) {
        return await this.actors.getPlayerActors(page, limit, order);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get an actor', description: 'Retrieve a single actor by its foundry ID.' })
    @ApiOkResponse({ description: 'The actor details.' })
    async findOne(@Param('id') id: string) {
        return await this.actors.getActor(id);
    }
}
