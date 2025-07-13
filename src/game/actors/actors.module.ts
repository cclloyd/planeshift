import { Module } from '@nestjs/common';
import { ActorsService } from './actors.service.js';
import { ActorsController } from './actors.controller.js';
import { FoundryModule } from '../../foundry/foundry.module.js';

@Module({
    imports: [FoundryModule],
    controllers: [ActorsController],
    providers: [ActorsService],
})
export class ActorsModule {}
