import { Controller, Get, HttpException, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { ScenesService } from './scenes.service.js';
import { ApiAuthGuard } from '../../auth/api.guard.js';
import { ApiOkResponse, ApiOperation, ApiSecurity } from '@nestjs/swagger';

@ApiSecurity('tokenAuth')
@UseGuards(ApiAuthGuard)
@Controller()
export class ScenesController {
    constructor(private readonly scenesService: ScenesService) {}

    @Get()
    @ApiOperation({ summary: 'Get all scenes', description: 'Retrieve a list of all scenes in the world.' })
    @ApiOkResponse({ description: 'Array of scenes.', isArray: true })
    async findAll() {
        return await this.scenesService.getAllScenes();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a scene', description: 'Retrieve a single scene by its ID.' })
    @ApiOkResponse({ description: 'Scene details.' })
    async findOne(@Param('id') id: string) {
        const scene = await this.scenesService.getScene(id);
        if (!scene) throw new HttpException(`Scene ${id} not found.`, HttpStatus.NOT_FOUND);
        return scene;
    }
}
