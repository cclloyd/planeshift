import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service.js';
import { MessagesController } from './messages.controller.js';
import { FoundryModule } from '../../foundry/foundry.module.js';
import { AuthModule } from '../../auth/auth.module.js';

@Module({
    imports: [FoundryModule, AuthModule],
    controllers: [MessagesController],
    providers: [MessagesService],
})
export class MessagesModule {}
