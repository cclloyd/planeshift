import { Controller, Get, HttpException, HttpStatus, Param } from '@nestjs/common';
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
        return await this.scenesService.getAllScenes();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const scene = await this.scenesService.getScene(id);
        if (!scene) throw new HttpException(`Scene ${id} not found.`, HttpStatus.NOT_FOUND);
        return scene;
    }
}
