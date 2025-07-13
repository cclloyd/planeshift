import { Module } from '@nestjs/common';
import { ScenesService } from './scenes.service.js';
import { ScenesController } from './scenes.controller.js';
import { FoundryModule } from '../../foundry/foundry.module.js';

@Module({
    imports: [FoundryModule],
    controllers: [ScenesController],
    providers: [ScenesService],
})
export class ScenesModule {}
