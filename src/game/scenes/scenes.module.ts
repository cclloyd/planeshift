import { Module } from '@nestjs/common';
import { ScenesService } from './scenes.service.js';
import { ScenesController } from './scenes.controller.js';
import { FoundryModule } from '../../foundry/foundry.module.js';
import { AuthModule } from '../../auth/auth.module.js';

@Module({
    imports: [FoundryModule, AuthModule],
    controllers: [ScenesController],
    providers: [ScenesService],
})
export class ScenesModule {}
