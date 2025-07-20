import { forwardRef, Module } from '@nestjs/common';
import { ApiKeysService } from './apikeys.service.js';
import { ApiKeysController } from './apikeys.controller.js';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiKey, ApiKeysSchema } from './schemas/apikeys.schema.js';
import { ApiKeyAuthGuard } from './apikeys.guard.js';
import { UsersModule } from '../users/users.module.js';
import { AuthModule } from '../auth.module.js';

@Module({
    imports: [UsersModule, forwardRef(() => AuthModule), MongooseModule.forFeature([{ name: ApiKey.name, schema: ApiKeysSchema }])],
    controllers: [ApiKeysController],
    providers: [ApiKeysService, ApiKeyAuthGuard],
    exports: [ApiKeysService, ApiKeyAuthGuard],
})
export class ApiKeysModule {}
