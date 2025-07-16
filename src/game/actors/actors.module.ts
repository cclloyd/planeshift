import { Module } from '@nestjs/common';
import { ActorsService } from './actors.service.js';
import { ActorsController } from './actors.controller.js';
import { FoundryModule } from '../../foundry/foundry.module.js';
import { AuthModule } from '../../auth/auth.module.js';

@Module({
    imports: [FoundryModule, AuthModule],
    controllers: [ActorsController],
    providers: [ActorsService],
})
export class ActorsModule {}
